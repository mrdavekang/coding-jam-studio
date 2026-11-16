"""Draw original pixel art and package the two editable Scratch projects."""
from hashlib import md5
from pathlib import Path
from struct import pack
from zipfile import ZipFile, ZIP_DEFLATED
from zlib import compress, crc32
import json
import random
import textwrap

ROOT = Path(__file__).resolve().parent / 'assets'
INK = '#19233e'
FONT = {
 'A':'0e11111f111111','B':'1e11111e11111e','C':'0f10101010100f','D':'1e11111111111e','E':'1f10101e10101f','F':'1f10101e101010',
 'G':'0f10101711110f','H':'1111111f111111','I':'0e04040404040e','J':'0702020212120c','K':'11121418141211','L':'1010101010101f',
 'M':'111b1515111111','N':'11191513111111','O':'0e11111111110e','P':'1e11111e101010','Q':'0e11111115120d','R':'1e11111e141211',
 'S':'0f10100e01011e','T':'1f040404040404','U':'1111111111110e','V':'11111111110a04','W':'11111115151b11','X':'11110a040a1111',
 'Y':'11110a04040404','Z':'1f01020408101f','0':'0e11131519110e','1':'040c040404040e','2':'0e11010204081f','3':'1e01010601011e',
 '4':'02060a121f0202','5':'1f10101e01011e','6':'0618101e11110e','7':'1f010204080808','8':'0e11110e11110e','9':'0e11110f01020c',
 '.':'00000000000c0c', ',':'00000000000c08', ':':'000c0c000c0c00', '!':'04040404040004','?':'0e110204040004','-':'0000000e000000', '/':'01010204080810',
 '+':'0004041f040400',' ':'00000000000000',
}

class Canvas:
    def __init__(self, w, h, colour=None):
        self.w, self.h = w, h
        self.data = bytearray(self.rgba(colour) * (w*h))

    @staticmethod
    def rgba(colour):
        return bytes.fromhex(colour[1:]) + b'\xff' if colour else b'\x00' * 4

    def rect(self, x, y, w, h, colour):
        left, right = max(0,x), min(self.w,x+w)
        if right <= left: return
        pixels = self.rgba(colour) * (right-left)
        for row in range(max(0,y), min(self.h,y+h)):
            at = (row*self.w + left)*4
            self.data[at:at+len(pixels)] = pixels

    def dot(self, x, y, r, colour):
        for j in range(-r,r+1):
            span=int((r*r-j*j)**0.5)
            self.rect(x-span, y+j, 2*span+1, 1, colour)

    def text(self, x, y, words, colour=INK, scale=2):
        for index, c in enumerate(words.upper()):
            pattern=bytes.fromhex(FONT.get(c,FONT[' ']))
            for row, bits in enumerate(pattern):
                for column in range(5):
                    if bits & (16 >> column):
                        self.rect(x+(index*6+column)*scale,y+row*scale,scale,scale,colour)

    def png(self):
        def chunk(kind, contents):
            return pack('!I',len(contents)) + kind + contents + pack('!I',crc32(kind+contents)&0xffffffff)
        stride=self.w*4
        raw=b''.join(b'\0'+self.data[i:i+stride] for i in range(0,len(self.data),stride))
        return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',pack('!2I5B',self.w,self.h,8,6,0,0,0)) + chunk(b'IDAT',compress(raw,9)) + chunk(b'IEND',b'')

def tree(c,x,y,tone='#287259'):
    c.rect(x-4,y,8,22,'#7c493c')
    c.rect(x-15,y-15,30,23,'#1e543f')
    c.rect(x-20,y-10,40,12,'#1e543f')
    c.rect(x-15,y-19,29,25,tone)
    c.rect(x-7,y-22,15,7,'#76ae65')
    c.rect(x-13,y-11,5,11,'#ace078')

def cap(c, title, subtitle, colour='#ffe39d'):
    c.rect(0,0,480,68,INK)
    c.text(18,13,title,colour,3)
    c.text(18,45,subtitle,'#e1e8fd',2)

def building(c,x,y,title,wall,roof):
    c.rect(x+6,y+8,116,81,'#325859')
    c.rect(x,y+20,116,66,wall)
    c.rect(x-6,y+15,128,15,roof)
    c.rect(x+4,y+8,106,9,roof)
    c.rect(x+13,y,90,10,roof)
    c.rect(x+47,y+51,22,35,INK)
    for xx in (x+13,x+83):
        c.rect(xx,y+43,21,19,INK)
        c.rect(xx+3,y+46,15,13,'#ffe194')
        c.rect(xx+11,y+45,2,15,'#61517f')
    c.text(x+14,y+33,title,INK,2)

def campus(night=False):
    c=Canvas(480,360,'#163f47' if night else '#5f9e70')
    rng=random.Random(90)
    for _ in range(150):
        x,y=rng.randrange(0,480),rng.randrange(70,359)
        c.rect(x,y,3,2,'#2a6163' if night else '#8cbf7b')
    for x,y in [(30,104),(449,102),(37,161),(444,165),(31,238),(450,244),(99,262),(373,262)]:
        tree(c,x,y,'#265d60' if night else '#368563')
    c.rect(94,198,291,30,'#d2b997')
    c.rect(224,224,32,69,'#d2b997')
    c.rect(106,175,24,25,'#d2b997')
    c.rect(349,175,24,25,'#d2b997')
    c.rect(230,253,17,5,'#f6e9c9')
    c.rect(230,238,17,5,'#f6e9c9')
    c.rect(0,298,480,62,INK)
    building(c,61,90,'LIBRARY','#e4c9aa','#674ca2')
    building(c,303,90,'OFFICE','#f0cb91','#9b4b56')
    cap(c,'Campus Quest','Click a destination to guide Scout')
    return c

def story(place):
    data={
        'Lantern Yard':('THE LANTERN TRAIL','Sam is new at the lantern fair.', ['The wind scattered the light tokens.', 'How will you invite Sam to join in?']),
        'Lantern Court':('THE LANTERN COURT','You invite Sam to play.', ['You show Sam the lantern game.', 'Sam finds the first light token.']),
        'Quiet Garden':('THE QUIET GARDEN','You ask what Sam would like.', ['Sam spots a token near the pond.', 'You draw a map for other newcomers.']),
    }
    title,sub,lines=data[place]
    yard=place=='Lantern Yard'
    garden=place=='Quiet Garden'
    c=Canvas(480,360,'#30264d' if not garden else '#173945')
    rng=random.Random(12)
    for _ in range(65):
        x,y=rng.randrange(480),rng.randrange(68,184)
        c.rect(x,y,2,2,'#a29bc7' if not garden else '#8ababc')
    c.dot(418,104,25,'#ffd89a')
    for x,y,w,h in [(0,166,480,116),(0,225,480,73)]:
        c.rect(x,y,w,h,'#31565f' if not garden else '#356863')
    for x,y in [(24,164),(454,179),(63,186),(406,186),(104,186)]:
        tree(c,x,y,'#407861')
    if garden:
        c.dot(327,228,44,'#46989e')
        c.rect(258,213,154,28,'#46989e')
        c.rect(289,228,77,3,'#9ce4db')
        c.rect(370,218,31,2,'#9ce4db')
    else:
        c.rect(168,186,213,69,'#5d4e77')
        for x in range(184,377,28): c.rect(x,190,2,59,'#b8a6c1')
        c.rect(154,183,237,4,'#f7d991')
    for index,x in enumerate((96,167,240,313,383)):
        y = (109,124,132,124,109)[index]
        c.rect(x-2,y-8,4,8,'#f5b36d')
        c.rect(x-9,y,18,16,'#d66163')
        c.rect(x-6,y+2,12,12,'#ffc66d')
        if not yard: c.rect(x-3,y+4,6,8,'#fff1a9')
    c.rect(0,252,480,108,'#19233e')
    cap(c,title,sub)
    for i,line in enumerate(lines): c.text(18,262+16*i,line,'#eff2ff',2)
    return c

def scout(pose):
    c=Canvas(57,66)
    c.rect(10,58,38,5,'#254858')
    for x in (12,35): c.rect(x+(3 if pose=='Walking' and x==12 else 0),50,11,10,INK)
    c.rect(8,19,40,34,INK)
    c.rect(12,22,32,26,'#f8d77b')
    c.rect(17,29,22,13,'#263549')
    c.rect(20,32,4,4,'#a9f1c1')
    c.rect(32,32,4,4,'#a9f1c1')
    c.rect(25,13,4,8,INK)
    c.dot(27,10,4,'#e89096')
    if pose=='Arrived':
        c.rect(1,16,4,15,'#fdd979')
        c.rect(0,21,13,4,'#fdd979')
        c.rect(47,3,4,15,'#fdd979')
        c.rect(42,8,14,4,'#fdd979')
    return c

def sam(pose):
    c=Canvas(70,96)
    c.rect(14,87,44,5,'#254858')
    c.rect(20,75,12,15,INK)
    c.rect(41,75,12,15,INK)
    c.rect(17,49,42,30,INK)
    c.rect(20,51,36,23,'#e47f68' if pose!='With token' else '#dda6ff')
    c.rect(13,13,50,40,INK)
    c.rect(16,17,44,34,'#b46f52')
    c.rect(15,15,46,12,'#33263c')
    c.rect(23,32,4,5,INK)
    c.rect(46,32,4,5,INK)
    c.rect(30,41,11,3,'#632d31')
    if pose != 'Thinking':
        c.rect(30,38,3,7,'#632d31')
        c.rect(39,38,3,7,'#632d31')
    if pose=='With token':
        c.dot(60,52,8,'#ffb86e')
        c.dot(60,52,4,'#fff18d')
    return c

def button(words, hue, w=190):
    c=Canvas(w,46)
    c.rect(1,7,w-2,38,INK)
    c.rect(4,5,w-8,36,hue)
    c.rect(7,8,w-14,3,'#f8ebda')
    c.text((w-len(words)*12)//2,17,words)
    return c

def micro_art():
    c=Canvas(480,360,'#19233e')
    cap(c,'ROOM SENTINEL','BBC micro:bit + Grove light sensor')
    for x in range(24,480,20):
        for y in range(79,350,20): c.rect(x,y,2,2,'#304163')
    c.rect(51,96,224,164,'#28272d')
    c.rect(59,105,208,136,'#3f3c46')
    for x in range(66,258,20): c.rect(x,237,11,28,'#e0ba61')
    c.rect(72,131,33,34,'#b2adc3')
    c.rect(222,131,33,34,'#b2adc3')
    c.text(83,141,'A')
    c.text(233,141,'B')
    tick={(0,2),(1,3),(2,4),(3,3),(4,2)}
    for y in range(5):
        for x in range(5): c.rect(121+17*x,130+17*y,11,11,'#ff6d83' if (x,y) in tick else '#594953')
    c.rect(274,192,67,8,'#f3b655')
    c.rect(338,154,91,72,'#3e8f7c')
    c.dot(387,191,16,'#d4c68e')
    c.text(49,300,'READ LIGHT / SHOW AN ICON','#f3e4bc')
    return c

def costume(canvas, name, filename, assets):
    data=canvas.png()
    digest=md5(data).hexdigest()
    assets[digest+'.png']=data
    return {'assetId':digest,'md5ext':digest+'.png','name':name,'dataFormat':'png','bitmapResolution':1,
            'rotationCenterX':canvas.w/2,'rotationCenterY':canvas.h/2}

def add_stack(blocks,index,seq):
    for j,(opcode,inputs,fields) in enumerate(seq):
        ident=f'{index}-{j}'
        top=j==0
        item=dict(opcode=opcode,next=f'{index}-{j+1}' if j+1 < len(seq) else None,parent=f'{index}-{j-1}' if j else None,
                  inputs={},fields=fields,shadow=False,topLevel=top)
        if top: item.update(x=28,y=(23, 240, 580)[index])
        for key,val in inputs.items():
            if len(val)==3 and val[0]=='menu':
                menu=f'{ident}-{key}'
                blocks[menu]=dict(opcode=val[1],next=None,parent=ident,inputs={},fields={key:[val[2],None]},shadow=True,topLevel=False)
                item['inputs'][key]=[1,menu]
            else: item['inputs'][key]=val
        blocks[ident]=item

def event(op, fields=None): return op,{},fields or {}
def menu(op,key,kind,value): return op,{key:['menu',kind,value]},{}
def text(msg,n): return ('looks_sayforsecs',{'MESSAGE':[1,[10,msg]],'SECS':[1,[4,n]]},{})
def go(x,y,glide=False):
    return ('motion_glidesecstoxy' if glide else 'motion_gotoxy',
            {**({'SECS':[1,[4,1]]} if glide else {}),'X':[1,[4,x]],'Y':[1,[4,y]]},{})
def wear(pose): return menu('looks_switchcostumeto','COSTUME','looks_costume',pose)
def backdrop(scene): return menu('looks_switchbackdropto','BACKDROP','looks_backdrops',scene)
def broadcast(msg): return ('event_broadcast',{'BROADCAST_INPUT':[1,[11,msg,msg.lower()]]},{})
def recv(msg): return event('event_whenbroadcastreceived',{'BROADCAST_OPTION':[msg,msg.lower()]})
def scene_event(scene): return event('event_whenbackdropswitchesto',{'BACKDROP':[scene,None]})
flag=event('event_whenflagclicked')
click=event('event_whenthisspriteclicked')

def package(slug, stage_scenes, buttons, actor, example=False):
    assets={}
    costumes=[costume(c,name,slug,assets) for name,c in stage_scenes]
    common=dict(variables={},lists={},broadcasts={},comments={},currentCostume=0,sounds=[],volume=100)
    stage_blocks={}
    is_map=slug=='find-your-way'
    if example and not is_map: add_stack(stage_blocks,0,[flag,backdrop('Lantern Yard')])
    targets=[dict(common,isStage=True,name='Stage',blocks=stage_blocks,costumes=costumes,layerOrder=0,
                  broadcasts={'library':'Library','office':'Office'} if is_map else {},tempo=60,videoTransparency=50,videoState='on',textToSpeechLanguage=None)]
    for idx,(name,c,x,y,result) in enumerate(buttons):
        block={}
        if example: add_stack(block,0,[click,broadcast(result) if is_map else backdrop(result)])
        targets.append(dict(common,isStage=False,name=name,blocks=block,costumes=[costume(c,'Button',slug,assets)],
                            layerOrder=idx+1,visible=True,x=x,y=y,size=100,direction=90,draggable=False,rotationStyle='all around'))
    name,poses,x,y=actor
    blocks={}
    if example and is_map:
        add_stack(blocks,0,[flag,go(0,-91),wear('Idle')])
        add_stack(blocks,1,[recv('Library'),wear('Walking'),go(0,-32,True),go(-120,-25,True),wear('Arrived'),text('Library: follow the left path.',3)])
        add_stack(blocks,2,[recv('Office'),wear('Walking'),go(0,-32,True),go(120,-25,True),wear('Arrived'),text('Office: follow the right path.',3)])
    elif example:
        add_stack(blocks,0,[flag,wear('Thinking')])
        add_stack(blocks,1,[scene_event('Lantern Court'),wear('With token')])
        add_stack(blocks,2,[scene_event('Quiet Garden'),wear('Smiling')])
    targets.append(dict(common,isStage=False,name=name,blocks=blocks,costumes=[costume(c,pose,slug,assets) for pose,c in poses],
                        layerOrder=3,visible=True,x=x,y=y,size=100,direction=90,draggable=False,rotationStyle='all around'))
    data=dict(targets=targets,monitors=[],extensions=[],meta=dict(semver='3.0.0',vm='0.2.0',agent='Coding Jam Studio'))
    folder='examples' if example else 'starters'
    suffix='example' if example else 'starter'
    with ZipFile(ROOT/folder/f'{slug}-{suffix}.sb3','w',ZIP_DEFLATED) as z:
        z.writestr('project.json',json.dumps(data))
        for filename,content in assets.items(): z.writestr(filename,content)

def write_assets():
    map_scenes=[('Campus',campus()),('Campus at dusk',campus(True))]
    story_scenes=[(n,story(n)) for n in ('Lantern Yard','Lantern Court','Quiet Garden')]
    scout_poses=[(n,scout(n)) for n in ('Idle','Walking','Arrived')]
    sam_poses=[(n,sam(n)) for n in ('Thinking','Smiling','With token')]
    map_buttons=[('Library',button('Library','#d6bcff'),-111,-151,'Library'),
                 ('Office',button('Office','#ffe092'),111,-151,'Office')]
    story_buttons=[('Invite Sam',button('Invite Sam','#ffd994',207),-113,-157,'Lantern Court'),
                   ('Ask Sam',button('Ask Sam','#a9e0d4',207),113,-157,'Quiet Garden')]
    for mode in (False,True):
        package('find-your-way',map_scenes,map_buttons,('Scout',scout_poses,0,-91),mode)
        package('playground-choices',story_scenes,story_buttons,('Sam',sam_poses,0,-20),mode)
    art={'campus':map_scenes[0][1],'campus-dusk':map_scenes[1][1],'lantern-yard':story_scenes[0][1],
        'lantern-court':story_scenes[1][1],'quiet-garden':story_scenes[2][1],'room-sentinel':micro_art(),
        **{f'scout-{n.lower()}':c for n,c in scout_poses},
        **{f'sam-{n.lower().replace(" ","-")}':c for n,c in sam_poses},
        'library-button':map_buttons[0][1], 'office-button':map_buttons[1][1],
        'invite-button':story_buttons[0][1], 'ask-button':story_buttons[1][1]}
    for name,canvas in art.items(): (ROOT/'art'/f'{name}.png').write_bytes(canvas.png())
    for slug, assets in [('campus-quest', ('campus','campus-dusk','scout-idle','scout-walking','scout-arrived','library-button','office-button')),
                         ('lantern-trail', ('lantern-yard','lantern-court','quiet-garden','sam-thinking','sam-smiling','sam-with-token','invite-button','ask-button'))]:
        with ZipFile(ROOT/'art'/f'{slug}-art.zip','w',ZIP_DEFLATED) as z:
            for asset in assets: z.write(ROOT/'art'/f'{asset}.png',f'{asset}.png')

if __name__=='__main__':
    write_assets()
