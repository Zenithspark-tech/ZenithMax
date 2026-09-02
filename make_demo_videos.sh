#!/usr/bin/env bash
set -euo pipefail
OUT="$(dirname "$0")/client/demo_videos"
FONT="/usr/share/fonts/truetype/lato/Lato-Medium.ttf"
mkdir -p "$OUT"

declare -a DATA=(
"neon-city-lights|Neon City Lights|DISCOVER|A colorful animated night drive through a futuristic city|0x14213d|0xfca311"
"football-focus|Football Focus|SPORTS|Animated football training session with dynamic score graphics|0x0b3d2e|0x7ee081"
"comic-pop|Comic Pop|ANIMATION|Original comic-style motion graphics bursting with energy|0x3b1f5f|0xff6ec7"
"creator-tips|Creator Tips|LEARN|Quick original tips for planning better short videos|0x102a43|0x63c5da"
"pixel-rush|Pixel Rush|GAMING|Retro-inspired pixel motion challenge created for ZenithMax|0x161a30|0x5eead4"
"travel-sunset|Travel Sunset|TRAVEL|A calm animated sunset journey across mountains and clouds|0x4a1942|0xffb86b"
"beat-lab|Beat Lab|MUSIC|Abstract rhythm visualizer made from original shapes and light|0x171717|0x00e5ff"
"science-burst|Science Burst|EDUCATION|Colorful animated science facts and floating molecules|0x082032|0x61dafb"
"street-art|Street Art Motion|ART|Original graffiti-inspired motion design without copyrighted artwork|0x231942|0xf72585"
"morning-motivation|Morning Motivation|LIFESTYLE|Positive animated morning message for creators|0x1b4332|0xffd166"
"goal-moments|Goal Moments|SPORTS|Fast animated football goal celebration graphics|0x001219|0x94d2bd"
"space-explorer|Space Explorer|SCIENCE|A playful original journey through colorful planets|0x10002b|0xc77dff"
"food-lab|Food Lab|FOOD|Fun animated recipe-card style food motion graphics|0x4a2511|0xffc857"
"design-drops|Design Drops|CREATIVE|Quick visual design ideas using geometric motion|0x14213d|0xfca311"
"comedy-cards|Comedy Cards|COMEDY|Clean original animated comedy title cards|0x370617|0xffd166"
"zenith-newsroom|Zenith Newsroom|NEWS|A fictional animated newsroom intro for ZenithMax|0x001233|0x4cc9f0"
"nature-flow|Nature Flow|NATURE|Relaxing original animation of leaves, water and light|0x0b3d20|0x80ed99"
"future-tech|Future Tech|TECH|Futuristic interface motion graphics made for ZenithMax|0x0b132b|0x5bc0eb"
"coding-lab|Coding Lab|TECH|Original animated coding concepts for curious creators|0x111827|0x22c55e"
"basketball-burst|Basketball Burst|SPORTS|Fast animated basketball motion graphics|0x1e293b|0xf97316"
"photo-school|Photo School|CREATIVE|Simple original visual composition tips in motion|0x312e81|0xa78bfa"
"study-focus|Study Focus|LEARN|Calm animated focus session for students and creators|0x0f172a|0x38bdf8"
"adventure-trails|Adventure Trails|TRAVEL|Original animated trail map and adventure sequence|0x14532d|0xfacc15"
"fashion-motion|Fashion Motion|STYLE|Stylized fashion title animation made for ZenithMax|0x3f0d2b|0xfb7185"
)

for row in "${DATA[@]}"; do
  IFS='|' read -r slug title category desc bg accent <<<"$row"
  file="$OUT/$slug.mp4"
  # 5-second original motion-graphic demo, silent to keep the starter library lightweight.
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=$bg:s=640x360:r=24:d=5" \
    -vf "drawbox=x='mod(t*130,w+180)-180':y=42:w=180:h=180:color=$accent@0.22:t=fill,drawbox=x='w-mod(t*95,w+220)':y=220:w=220:h=90:color=$accent@0.16:t=fill,drawtext=fontfile=$FONT:text='ZENITHMAX ORIGINAL':fontcolor=white:fontsize=20:x=28:y=24,drawtext=fontfile=$FONT:text='$category':fontcolor=$accent:fontsize=22:x=28:y=286,drawtext=fontfile=$FONT:text='$title':fontcolor=white:fontsize=30:x=28:y=315:shadowcolor=black@0.6:shadowx=2:shadowy=2" \
    -c:v libx264 -preset veryfast -crf 30 -pix_fmt yuv420p -movflags +faststart -an "$file"
done
