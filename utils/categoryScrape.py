import urllib.request
import json
import os

savePath = "C:/Users/Vojcek/Desktop/BP/CODES/satviz/js/res/selectCategories.json"

websites = [
    "https://www.celestrak.com/NORAD/elements/stations.txt",
    "https://www.celestrak.com/NORAD/elements/weather.txt",
    "https://www.celestrak.com/NORAD/elements/noaa.txt",
    "https://www.celestrak.com/NORAD/elements/goes.txt",
    "https://www.celestrak.com/NORAD/elements/resource.txt",
    "https://www.celestrak.com/NORAD/elements/sarsat.txt",
    "https://www.celestrak.com/NORAD/elements/dmc.txt",
    "https://www.celestrak.com/NORAD/elements/tdrss.txt",
    "https://www.celestrak.com/NORAD/elements/argos.txt",

    "https://www.celestrak.com/NORAD/elements/intelsat.txt",
    "https://www.celestrak.com/NORAD/elements/ses.txt",
    "https://www.celestrak.com/NORAD/elements/iridium.txt",
    "https://www.celestrak.com/NORAD/elements/iridium-NEXT.txt",
    "https://www.celestrak.com/NORAD/elements/oneweb.txt",
    "https://www.celestrak.com/NORAD/elements/orbcomm.txt",
    "https://www.celestrak.com/NORAD/elements/globalstar.txt",
    "https://www.celestrak.com/NORAD/elements/amateur.txt",
    "https://www.celestrak.com/NORAD/elements/x-comm.txt",
    "https://www.celestrak.com/NORAD/elements/other-comm.txt",
    "https://www.celestrak.com/NORAD/elements/gorizont.txt",
    "https://www.celestrak.com/NORAD/elements/raduga.txt",
    "https://www.celestrak.com/NORAD/elements/molniya.txt",

    "https://www.celestrak.com/NORAD/elements/gps-ops.txt",
    "https://www.celestrak.com/NORAD/elements/glo-ops.txt",
    "https://www.celestrak.com/NORAD/elements/galileo.txt",
    "https://www.celestrak.com/NORAD/elements/beidou.txt",
    "https://www.celestrak.com/NORAD/elements/sbas.txt",
    "https://www.celestrak.com/NORAD/elements/nnss.txt",
    "https://www.celestrak.com/NORAD/elements/musson.txt",

    "https://www.celestrak.com/NORAD/elements/science.txt",
    "https://www.celestrak.com/NORAD/elements/geodetic.txt",
    "https://www.celestrak.com/NORAD/elements/engineering.txt",
    "https://www.celestrak.com/NORAD/elements/education.txt",

    "https://www.celestrak.com/NORAD/elements/military.txt",
    "https://www.celestrak.com/NORAD/elements/radar.txt",
    "https://www.celestrak.com/NORAD/elements/cubesat.txt",
    "https://www.celestrak.com/NORAD/elements/other.txt",
]

names = [
    "Space Stations",
    "Weather",
    "NOAA",
    "GOES",
    "Earth Resources",
    "Search & Rescue (SARSAT)",
    "Disaster Monitoring",
    "TDRSS",
    "ARGOS",

    "INTELSAT",
    "SES",
    "IRIDIUM",
    "IRIDIUM-NEXT",
    "ONEWEB",
    "Orbcomm",
    "Globalstar",
    "Amateur Radio",
    "Experimental",
    "Other communication",
    "Gorizont",
    "Raduga",
    "Molniya",

    "GPS Operational",
    "GLONASS Operational",
    "Gallileo",
    "Beidou",
    "WAAS/EGNOS/MSAS",
    "NNSS",
    "Russian LEO Navigation",

    "Space & Earth Science",
    "Geodetic",
    "Engineering",
    "Education",

    "Millitary misc",
    "Radar Calibration",
    "Cubesat",
    "Other",
]

print("Web count: " + str(len(websites)))
print("Name count: " + str(len(names)))
linecounttotal = 0

parent_ids = []

select = []

for i in range(len(websites)):
    parent_ids.append(i)

for i in range(len(websites)):
    print("Processing :" + websites[i])
    print("Name: " + names[i])
    print("")

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
                'name': name.strip(),
                'id': satid,
            })

        lineCounter += 1
        lineCounter %= 3

        linecounttotal += 1

    # sort by category name
    children = sorted(children, key= lambda i: i['name'])

    parent['children'] = children
    select.append(parent)

# sort by parent name
select = sorted(select, key= lambda i: i['name'])

print("Total lines " + str(linecounttotal))

with open(savePath, 'w', encoding='utf-8') as f:
    json.dump(select, f, ensure_ascii=False, indent=4)