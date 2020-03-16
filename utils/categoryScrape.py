import urllib.request
import json

savePath = "../js/res/selectCategories.json"

websites = [
    "https://www.celestrak.com/NORAD/elements/gps-ops.txt",
    "https://www.celestrak.com/NORAD/elements/weather.txt",
    "https://www.celestrak.com/NORAD/elements/starlink.txt",
]

names = [
    "GPS OPERATIONAL",
    "WEATHER",
    "STARLINK"
]

parent_ids = [
    1,
    2,
    3
]

select = []


for i in range(len(websites)):
    data = urllib.request.urlopen(websites[i])
    lineCounter = 0

    parent = {
        'name': names[i],
        'id': parent_ids[i],
    }

    children = []

    name = ""
    satid = ""
    for line in data:
        decoded = line.decode('utf-8')

        if lineCounter == 0:
            name = decoded[:23]
        elif lineCounter == 1:
            satid = decoded[2:7]
        elif lineCounter == 2:
            children.append({
                'name': name,
                'id': satid,
            })

        lineCounter += 1
        lineCounter %= 3

    parent['children'] = children
    select.append(parent)

# print(json.dumps(select))

with open(savePath, 'w') as out:
    json.dump(select, out)