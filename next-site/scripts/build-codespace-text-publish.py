import json
import re
import shlex
import subprocess
import sys
from pathlib import Path

# Generates a reviewed native-terminal command; never authenticates or pushes locally.
# Binary commits must use the recovery-bundle workflow.
repo = Path(__file__).resolve().parents[2]
def local(*args):
    return subprocess.check_output(['git', '-C', str(repo), *args])

assert local('branch', '--show-current').decode().strip() == 'experiment/immersive-world-2026-10-09', 'Use only the experimental branch.'
assert local('status', '--porcelain') == b'', 'Commit and review changes first.'
assert len(sys.argv) <= 2, 'Pass at most one experimental commit.'
sha = local('rev-parse', '--verify', (sys.argv[1] if len(sys.argv) == 2 else 'HEAD') + '^{commit}').decode().strip()
subprocess.check_call(['git', '-C', str(repo), 'merge-base', '--is-ancestor', sha, 'HEAD'])
parent = local('rev-parse', sha + '^').decode().strip()
assert re.fullmatch('[0-9a-f]{40}', sha) and re.fullmatch('[0-9a-f]{40}', parent)
raw = local('cat-file', 'commit', sha).decode('utf-8')
assert sum(line.startswith('parent ') for line in raw.split('\n\n', 1)[0].splitlines()) == 1, 'Use the bundle workflow for merge commits.'
patch = local('diff', '--binary', parent, sha).decode('utf-8')
assert not re.search(r'^GIT binary patch$', patch, re.MULTILINE), 'Use the bundle flow for binary changes.'
files = local('diff', '--name-only', parent, sha).decode().splitlines()
assert files and all(f == 'WORK_CHECKPOINT.md' or f.startswith('next-site/') for f in files)
assert all(not Path(f).name.startswith('.env') or Path(f).name == '.env.example' for f in files), 'Never publish credential files.'
payload = {'sha': sha, 'parent': parent, 'raw': raw, 'patch': patch}
script = '''import json, os, subprocess, tempfile
from pathlib import Path
payload = json.loads(PAYLOAD_LITERAL)
mirror = '/workspaces/zack-experimental-publish.y2QMu0/repository.git'
branch = 'refs/heads/experiment/immersive-world-2026-10-09'
def run(*args, data=None, env=None):
    return subprocess.check_output(['git', '--git-dir=' + mirror, *args], input=data, env=env)
assert run('rev-parse', branch).decode().strip() == payload['parent'], 'Mirror head changed; do not overwrite it.'
assert subprocess.check_output(['git', '-C', '/workspaces/zackdcook.github.io', 'status', '--porcelain']) == b'', 'Original checkout is not clean.'
with tempfile.TemporaryDirectory(prefix='editorial-index-', dir=str(Path(mirror).parent)) as scratch:
    env = dict(os.environ, GIT_INDEX_FILE=str(Path(scratch) / 'index'))
    run('read-tree', payload['parent'], env=env)
    run('apply', '--cached', '--check', '--whitespace=error-all', '-', data=payload['patch'].encode('utf-8'), env=env)
    run('apply', '--cached', '--whitespace=error-all', '-', data=payload['patch'].encode('utf-8'), env=env)
    tree = run('write-tree', env=env).decode().strip()
    assert payload['raw'].startswith('tree ' + tree + '\\nparent ' + payload['parent'] + '\\n'), 'Tree or parent differs from the tested commit.'
    imported = run('hash-object', '-w', '-t', 'commit', '--stdin', data=payload['raw'].encode('utf-8')).decode().strip()
    assert imported == payload['sha'], 'Commit bytes differ; do not publish.'
    run('merge-base', '--is-ancestor', payload['parent'], imported)
    run('update-ref', branch, imported, payload['parent'])
    run('push', 'origin', branch + ':' + branch)
    remote = run('ls-remote', 'origin', branch, 'refs/heads/main').decode()
    assert payload['sha'] + '\\t' + branch in remote, 'Remote head does not match.'
    print(remote, end='')
    assert subprocess.check_output(['git', '-C', '/workspaces/zackdcook.github.io', 'status', '--porcelain']) == b'', 'Original checkout changed.'
    print('PUBLISHED_EXACT ' + payload['sha'])
'''.replace('PAYLOAD_LITERAL', repr(json.dumps(payload, ensure_ascii=True)))
output = repo.parent / ('editorial-native-git-publish-' + sha[:7] + '.txt')
compile(script, '<reviewed-native-publish>', 'exec')
output.write_text('python3 -c ' + shlex.quote('exec(' + repr(script) + ')') + ' # reviewed experimental commit\n', encoding='utf-8')
output.chmod(0o600)
script_file = output.with_suffix('.py')
script_file.write_text(script, encoding='utf-8')
script_file.chmod(0o600)
print(json.dumps({'script_file': str(script_file), 'command_file': str(output), 'sha': sha, 'parent': parent, 'files': files, 'characters': output.stat().st_size}))
