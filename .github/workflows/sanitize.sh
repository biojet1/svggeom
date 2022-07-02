

python << 'EOF'
import re
from os import environ, path
from sys import stdout
from json import load, dump, dumps

CI = environ.get('CI') == 'true' and path.isdir(environ.get('RUNNER_TEMP'))

drop_m = re.compile(r'^(?:scripts|files|c8|_.*|\..*)$')

with open('package.json') as r:
	data = load(r)
	for k in list(data.keys()):
		drop_m.match(k) and data.pop(k)
	if CI:
		r.close()
		out = lambda: open('package.json', 'w')
	else:
		out = lambda: stdout
	with out() as w:
		dump(data, w, indent=4)
EOF

npx prettier --write package.json || true