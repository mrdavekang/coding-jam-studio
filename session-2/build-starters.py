"""Make the three Scratch starter files and optional local examples for screenshots."""
from hashlib import md5
from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import sys

OUT = Path(__file__).resolve().parent / 'assets' / 'starters'
INK = '#213c37'

def label(x, y, value, size=19, weight=600, fill=INK):
    return f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{escape(value)}</text>'

def box(x, y, w, h, fill, radius=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{INK}" stroke-width="2"/>'

def stage(colour, title, intro, art=''):
    lines = ''.join(label(25, 78 + i * 24, line) for i, line in enumerate(intro))
    return f'<rect width="480" height="360" fill="{colour}"/>' + label(25, 44, title, 28, 800) + lines + art

def button(words, colour, width=210, checked=None):
    if checked is None:
        return box(2, 2, width-4, 52, colour) + label(15, 34, words, 15 if len(words) > 21 else 17, 800)
    tick = '<path d="m17 30 7 7 14-17" fill="none" stroke="#213c37" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"/>' if checked else ''
    return box(2, 2, width-4, 52, colour) + box(11, 15, 32, 28, '#ffffff', 4) + tick + label(52, 34, words, 19, 750)

def make_costume(assets, name, art, width, height):
    data = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">{art}</svg>'.encode()
    asset_id = md5(data).hexdigest()
    filename = f'{asset_id}.svg'
    assets[filename] = data
    return dict(assetId=asset_id, md5ext=filename, dataFormat='svg', name=name, bitmapResolution=1, rotationCenterX=width/2, rotationCenterY=height/2)

def stack(opcode, field=None, inputs=None, detached=False):
    return {
        'click': dict(opcode='event_whenthisspriteclicked', next=None if detached else 'response', parent=None,
                      inputs={}, fields={}, shadow=False, topLevel=True, x=55, y=44),
        'response': dict(opcode=opcode, next=None, parent=None if detached else 'click', inputs=inputs or {},
                         fields=field or {}, shadow=False, topLevel=detached,
                         **(dict(x=55, y=126) if detached else {})),
    }

MAP_ART = (
    '<path d="M240 252V196H128v-29m112 29h112v-29" fill="none" stroke="#8bac9c" stroke-width="12" stroke-linejoin="round"/>'
    + box(65, 121, 126, 47, '#d6c9f0') + label(95, 152, 'Library', 19, 750)
    + box(289, 121, 126, 47, '#f6c2a6') + label(326, 152, 'Office', 19, 750)
    + box(176, 240, 128, 43, '#ddf385') + label(196, 267, 'You are here', 16, 750)
)
PLAYGROUND_ART = '<rect x="24" y="164" width="432" height="113" rx="17" fill="#ddf385"/><path d="M49 230h382m-190-66v113" stroke="#fcfff0" stroke-width="3"/><circle cx="173" cy="204" r="19" fill="#a78bdc"/><circle cx="303" cy="234" r="18" fill="#edab89"/><circle cx="402" cy="196" r="13" fill="#fffefb" stroke="#213c37" stroke-width="2"/>'
BENCH_ART = '<rect x="24" y="164" width="432" height="113" rx="17" fill="#c8e6ef"/><path d="M145 195h184v32H145zm-12 41h208v12H133zm27 12v21m155-21v21" fill="#b97c50" stroke="#213c37" stroke-width="4"/><circle cx="216" cy="191" r="14" fill="#ddf385"/><circle cx="269" cy="195" r="14" fill="#d5c6f1"/>'

MAP = {
    'slug': 'find-your-way',
    'scenes': [('School map', stage('#eef4ee', 'Find Your Way', ['Choose a place on this practice map.'], MAP_ART))],
    'buttons': [('Library', '#d5c6f1', -112, -135, 210, None), ('Office', '#f5c2a9', 112, -135, 210, None)],
    'responses': [stack('looks_sayforsecs', inputs={'MESSAGE': [1, [10, 'Go straight. Turn left.']], 'SECS': [1, [4, '6']]}),
                  stack('looks_sayforsecs', inputs={'MESSAGE': [1, [10, 'Go straight. Turn right.']], 'SECS': [1, [4, '6']]})],
}
STORY = {
    'slug': 'playground-choices',
    'scenes': [
        ('Playground', stage('#f2edfa', 'Playground Choices', ['Sam is new and standing by the fence.', 'What will you do?'], PLAYGROUND_ART)),
        ('Join the game', stage('#f0f5dc', 'Join the game', ['Sam says, “I don’t know the rules.”', 'You explain and let Sam take the first turn.'], PLAYGROUND_ART)),
        ('Quiet bench', stage('#e7f4f7', 'Quiet bench', ['Sam asks for somewhere quiet.', 'At the bench, you find you both like drawing.'], BENCH_ART)),
    ],
    'buttons': [('Invite Sam to play', '#d5c6f1', -110, -135, 207, None), ('Ask what Sam would like', '#c8e6ef', 110, -135, 217, None)],
    'responses': [stack('looks_switchbackdropto', inputs={'BACKDROP': [1, 'menu']}),
                  stack('looks_switchbackdropto', inputs={'BACKDROP': [1, 'menu']})],
    'menus': ('looks_backdrops', 'BACKDROP', ['Join the game', 'Quiet bench']),
}
CHECKLIST = {
    'slug': 'switch-off-checker',
    'scenes': [('Classroom', stage('#f9efde', 'Switch-Off Checker', ['Last to leave the classroom?', 'Click an item after you’ve checked it.']))],
    'buttons': [('Lights off', '#f7e8a5', 0, 5, 306, True), ('Projector off', '#f7e8a5', 0, -69, 306, True)],
    'responses': [stack('looks_switchcostumeto', inputs={'COSTUME': [1, 'menu']}),
                  stack('looks_switchcostumeto', inputs={'COSTUME': [1, 'menu']})],
    'menus': ('looks_costume', 'COSTUME', ['Checked', 'Checked']),
}

def make_project(item, file, mode='starter'):
    assets = {}
    costumes = [make_costume(assets, name, art, 480, 360) for name, art in item['scenes']]
    common = dict(variables={}, lists={}, broadcasts={}, comments={}, currentCostume=0, sounds=[], volume=100)
    targets = [dict(common, isStage=True, name='Stage', blocks={}, costumes=costumes, layerOrder=0,
                    tempo=60, videoTransparency=50, videoState='on', textToSpeechLanguage=None)]
    for index, (name, colour, x, y, width, is_checkbox) in enumerate(item['buttons']):
        costumes = ([make_costume(assets, state, button(name, colour, width, checked), width, 56)
                     for state, checked in [('To do', False), ('Checked', True)]] if is_checkbox else
                    [make_costume(assets, 'Button', button(name, colour, width), width, 56)])
        blocks = {}
        if mode == 'example':
            blocks = item['responses'][index]
            if 'menus' in item:
                opcode, field, values = item['menus']
                blocks['menu'] = dict(opcode=opcode, next=None, parent='response', inputs={}, fields={field: [values[index], None]}, shadow=True, topLevel=False)
        if index == 0 and mode in ('practice', 'separate'):
            blocks = stack('looks_sayforsecs', inputs={'MESSAGE': [1, [10, 'Hello!']], 'SECS': [1, [4, '2']]}, detached=mode == 'separate')
        targets.append(dict(common, isStage=False, name=name, blocks=blocks, costumes=costumes,
                            layerOrder=index+1, visible=True, x=x, y=y, size=100, direction=90,
                            draggable=False, rotationStyle='all around'))
    data = dict(targets=targets, monitors=[], extensions=[], meta=dict(semver='3.0.0', vm='0.2.0', agent='Coding Jam Studio'))
    with ZipFile(file, 'w', ZIP_DEFLATED) as archive:
        archive.writestr('project.json', json.dumps(data, ensure_ascii=False))
        for name, contents in assets.items():
            archive.writestr(name, contents)

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for project in (MAP, STORY, CHECKLIST):
        make_project(project, OUT / f"{project['slug']}-starter.sb3")
    if len(sys.argv) == 2:
        examples = Path(sys.argv[1])
        examples.mkdir(parents=True, exist_ok=True)
        for project in (MAP, STORY, CHECKLIST):
            make_project(project, examples / f"{project['slug']}-example.sb3", 'example')
        for mode in ('practice', 'separate'):
            make_project(MAP, examples / f'{mode}.sb3', mode)
