#!/bin/bash
# Download activity & photography images from Unsplash (free to use)
DIR="frontend/public/addon-images"

download() {
  local file="$1"
  local url="$2"
  if [ ! -f "$DIR/$file" ] || [ $(stat -f%z "$DIR/$file" 2>/dev/null || echo 0) -lt 5000 ]; then
    curl -sL -o "$DIR/$file" "$url"
    echo "Downloaded: $file ($(stat -f%z "$DIR/$file" 2>/dev/null || echo '?') bytes)"
  else
    echo "Exists: $file"
  fi
}

# Fun Entertainers
download "magician.jpg" "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop"
download "joker.jpg" "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop"
download "puppet-show.jpg" "https://images.unsplash.com/photo-1559638753-d8e532e6dbba?w=400&h=300&fit=crop"
download "balloon-sculptor.jpg" "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
download "juggler.jpg" "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop"
download "stilt-walkers.jpg" "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop"
download "anchoring.jpg" "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop"
download "game-host.jpg" "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"

# Fun Party Artists
download "face-painting.jpg" "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=400&h=300&fit=crop"
download "tattoo.jpg" "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=300&fit=crop"
download "caricature.jpg" "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
download "digital-caricature.jpg" "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop"
download "mug-caricature.jpg" "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop"
download "mehandi.jpg" "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=400&h=300&fit=crop"
download "nail-art.jpg" "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop"
download "hair-beading.jpg" "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop"

# Kids Craft Activities
download "clay-modelling.jpg" "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop"
download "canvas-painting.jpg" "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
download "pottery.jpg" "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop"
download "slime-art.jpg" "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop"
download "pebble-painting.jpg" "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
download "key-chain-making.jpg" "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop"
download "arts-crafts-corner.jpg" "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"

# Game Stalls
download "balloon-shooting.jpg" "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"
download "ring-toss.jpg" "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"
download "giant-jenga.jpg" "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&h=300&fit=crop"
download "mini-golf.jpg" "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop"
download "mini-bowling.jpg" "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400&h=300&fit=crop"
download "foosball.jpg" "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=400&h=300&fit=crop"

# Live Eateries
download "cotton-candy.jpg" "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop"
download "popcorn.jpg" "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&h=300&fit=crop"
download "ice-gola.jpg" "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop"
download "chocolate-fountain.jpg" "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop"
download "potato-twister.jpg" "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=300&fit=crop"

# Kids Play Rentals
download "bouncing-castle.jpg" "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"
download "ball-pool-slider.jpg" "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=300&fit=crop"
download "bubble-house.jpg" "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
download "track-train-ride.jpg" "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"

# Photography
download "photography.jpg" "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=300&fit=crop"
download "candid-photography.jpg" "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
download "traditional-photo-video.jpg" "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=400&h=300&fit=crop"
download "candid-videography.jpg" "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop"
download "traditional-videography.jpg" "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop"

echo ""
echo "=== All downloads complete ==="
