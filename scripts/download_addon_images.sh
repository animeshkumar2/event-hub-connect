#!/bin/bash
# Download add-on images from PartyOne and rename to match our catalog IDs
# Usage: bash scripts/download_addon_images.sh

BASE_URL="https://www.partyone.in"
OUT_DIR="frontend/public/addon-images"
mkdir -p "$OUT_DIR"

echo "Downloading add-on images..."

# Format: catalog-id|image-path
# Entrance Arch
curl -sL "$BASE_URL/addon-images/2/1750054822_jc8s0_512.jpg" -o "$OUT_DIR/rectangle-arch.jpg"
curl -sL "$BASE_URL/addon-images/2/1750055014_Colorful_spiral_balloon_arch.jpg" -o "$OUT_DIR/u-shaped-arch.jpg"
curl -sL "$BASE_URL/addon-images/2/1750055148_1709031681_original.jpg" -o "$OUT_DIR/l-shaped-arch.jpg"
curl -sL "$BASE_URL/addon-images/2/1750055350_Organic-Balloon-Decor-demiarch-blue-pink-white-baby-shower-entrance.jpg" -o "$OUT_DIR/curve-arch.jpg"

# Cake Tables
curl -sL "$BASE_URL/addon-images/3/1750055516_rs=w365,h365,cgtrue,m.jpg" -o "$OUT_DIR/cylindrical-cake-table.jpg"
curl -sL "$BASE_URL/addon-images/3/1750056039_170842264749185.jpg" -o "$OUT_DIR/iron-cake-table.jpg"
curl -sL "$BASE_URL/addon-images/3/1750056273_522111730_max.jpg" -o "$OUT_DIR/paper-cake-table.jpg"
curl -sL "$BASE_URL/addon-images/3/1750056375_81JkncYYpiL.jpg" -o "$OUT_DIR/cylindrical-cake-table-set.jpg"
curl -sL "$BASE_URL/addon-images/3/1750056418_image_390597dc-f129-4866-b7ff-e2533cdabad4.jpg" -o "$OUT_DIR/paper-cake-table-set.jpg"
curl -sL "$BASE_URL/addon-images/3/1750056515_Superhero-Themed-Birthday-Party-Decoration-In-Bangalore.jpg" -o "$OUT_DIR/cake-table-theme-flex.jpg"

# Foil Balloons (Alphabet & Digit)
curl -sL "$BASE_URL/addon-images/5/1750056947_618JKXv-YUL._AC_UF1000,1000_QL80_.jpg" -o "$OUT_DIR/gold-alphabet-foil.jpg"
curl -sL "$BASE_URL/addon-images/5/1750057145_whatsapp-image-2024-08-10-at-12-45-50-500x500.jpeg" -o "$OUT_DIR/gold-digit-foil.jpg"
curl -sL "$BASE_URL/addon-images/5/1750057228_silver-alphabets-500x500.jpg" -o "$OUT_DIR/silver-alphabet-foil.jpg"
curl -sL "$BASE_URL/addon-images/5/1750057371_silver-color-number-foil-balloon-large-quality-digit-803772.jpg" -o "$OUT_DIR/silver-digit-foil.jpg"
curl -sL "$BASE_URL/addon-images/5/1750065421_197f9a5f59f6514206b6eb9ff4851afa.jpg" -o "$OUT_DIR/baby-name-pillar.jpg"
curl -sL "$BASE_URL/addon-images/5/1750065616_katamari_number_centerpiece.jpg" -o "$OUT_DIR/number-centerpiece.jpg"
curl -sL "$BASE_URL/addon-images/5/1750065715_1GYz2dUm-Column-3.jpg" -o "$OUT_DIR/number-balloon-pillar.jpg"

# Foil Curtains
curl -sL "$BASE_URL/addon-images/6/1750066483_2-pcs-silver-foil-curtains-for-decoration-birthday-party-original-imahbacgfqj4zs78.jpeg" -o "$OUT_DIR/silver-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750066747_sdfjksdff.jpg" -o "$OUT_DIR/gold-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750066808_dfhsjdvf.jpg" -o "$OUT_DIR/rose-gold-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750066956_sejhksee.jpg" -o "$OUT_DIR/pink-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750067097_hippity-hop-foil-blue-foil-fringe-curtain-pack-of-4-product-images-orviwfv2d2s-p591727918-0-202205300915.jpg" -o "$OUT_DIR/blue-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750067183_91pR+V4qnTL.jpg" -o "$OUT_DIR/green-frill-curtains.jpg"
curl -sL "$BASE_URL/addon-images/6/1750067306_dsfjjfdskff.jpg" -o "$OUT_DIR/red-frill-curtains.jpg"

# Shape Foil Balloons
curl -sL "$BASE_URL/addon-images/7/1750158816_71lfMjPsFcL.jpg" -o "$OUT_DIR/star-gold-foil.jpg"
curl -sL "$BASE_URL/addon-images/7/1750162669_3-3-4d-18-silver-gold-rose-gold-round-foil-balloon-pack-of-3-original-imag8qa5j79jeqrk%20(2).jpeg" -o "$OUT_DIR/4d-foil-balloon.jpg"
curl -sL "$BASE_URL/addon-images/7/1750162727_41-lVHWjkzL%20(1).jpg" -o "$OUT_DIR/red-love-cursive-foil.jpg"
curl -sL "$BASE_URL/addon-images/7/1750162846_2-aesthetic-heart-shape-red-10-inch-foil-balloon-air-and-helium-original-imag3c4c3jkh4kyz%20(3).jpeg" -o "$OUT_DIR/heart-shape-foil.jpg"
curl -sL "$BASE_URL/addon-images/7/1750163102_c81e624de40976f265a1012e532e1af1%20(1).jpg" -o "$OUT_DIR/foil-balloons-assorted.jpg"
curl -sL "$BASE_URL/addon-images/7/1750162885_41Ypy3qCZQL._AC_UF1000,1000_QL80_%20(1).jpg" -o "$OUT_DIR/ring-foil-balloon.jpg"
curl -sL "$BASE_URL/addon-images/7/1750162985_s-l1600%20(1).jpg" -o "$OUT_DIR/star-silver-foil.jpg"

# LED Lights & Candles
curl -sL "$BASE_URL/addon-images/8/1750163393_659c064acd3c5e1d1f1391b7-unido-box-4-pack-string-fairy-lights-20.jpg" -o "$OUT_DIR/fairy-lights.jpg"
curl -sL "$BASE_URL/addon-images/8/1750163757_61cubwuJ18L._AC_UF1000,1000_QL80_.jpg" -o "$OUT_DIR/led-par-cams.jpg"
curl -sL "$BASE_URL/addon-images/8/1750164182_bandekar-home-decor-flameless-24-blinking-look-real-diya-led-original-imah53fjuxyh76gr.jpeg" -o "$OUT_DIR/led-candles.jpg"
curl -sL "$BASE_URL/addon-images/8/1750164339_LED-Focus-Light-Rental-for-Parties-Bangalore-1%20(1).jpg" -o "$OUT_DIR/focus-light.jpg"
curl -sL "$BASE_URL/addon-images/8/1750227324_Sedbacf4d330244789ed44e66918fd0dd5%20(1).jpg" -o "$OUT_DIR/name-letter-led.jpg"
curl -sL "$BASE_URL/addon-images/8/1750227439_unicorn-marquee-light-500x500.jpg" -o "$OUT_DIR/digit-led.jpg"

# Occasion Foil Balloons
curl -sL "$BASE_URL/addon-images/10/1750231111_16inch-ROSE-GOLD-hbe-mine-proposale-party-supplies-decorations-1_300x.webp" -o "$OUT_DIR/be-mine-foils.webp"
curl -sL "$BASE_URL/addon-images/10/1750231236_51dIvupz80L._AC_UF1000,1000_QL80_.jpg" -o "$OUT_DIR/welcome-baby-foil.jpg"
curl -sL "$BASE_URL/addon-images/10/1750231322_41ChnJY2M+L._QL92_SH45_SS200_%20(1).jpg" -o "$OUT_DIR/naming-ceremony-foil.jpg"
curl -sL "$BASE_URL/addon-images/10/1750231444_202007031812411676838761__Baby_shower_foil_balloon_edit.jpg" -o "$OUT_DIR/baby-shower-foil.jpg"
curl -sL "$BASE_URL/addon-images/10/1750231516_617dkPht7TS.jpg" -o "$OUT_DIR/i-love-u-foils.jpg"
curl -sL "$BASE_URL/addon-images/10/1750231636_617dkPht7TS.jpg" -o "$OUT_DIR/mr-ms-foils.jpg"
curl -sL "$BASE_URL/addon-images/10/1750231763_9c65263b-6910-4e28-b4c5-91d75180a794_79851_1.png" -o "$OUT_DIR/happy-anniversary-foil.png"
curl -sL "$BASE_URL/addon-images/10/1750231849_HappyBirthdayGoldFoilBalloon1_62799c8f-e2d5-4f7f-b877-4f6347d836c7_2048x.jpg" -o "$OUT_DIR/happy-birthday-foil.jpg"

# Occasion Buntings
curl -sL "$BASE_URL/addon-images/11/1750231609_6813eb1006e2dac627081777-red-happy-birthday-banner-sign-happy.jpg" -o "$OUT_DIR/happy-birthday-bunting.jpg"
curl -sL "$BASE_URL/addon-images/11/1750232265_41jkJUtBbnL._SS400_.jpg" -o "$OUT_DIR/naming-ceremony-bunting.jpg"
curl -sL "$BASE_URL/addon-images/11/1750232326_happy-anniversary-paper-hanging-banner-for-couple-party-original-imafxcg9ypgzxcdr.jpeg" -o "$OUT_DIR/happy-anniversary-bunting.jpg"
curl -sL "$BASE_URL/addon-images/11/1750232385_71aNvxYqb2L.jpg" -o "$OUT_DIR/baby-shower-bunting.jpg"
curl -sL "$BASE_URL/addon-images/11/1750232573_61RWN5UbDbL._AC_UF894,1000_QL80_%20(1).jpg" -o "$OUT_DIR/welcome-baby-bunting.jpg"

# Stands
curl -sL "$BASE_URL/addon-images/14/1750232729_61uF-eHUm0L.jpg" -o "$OUT_DIR/stand-8x8.jpg"
curl -sL "$BASE_URL/addon-images/14/1750232768_index.jpg" -o "$OUT_DIR/stand-6x6.jpg"

# Ceiling Decor
curl -sL "$BASE_URL/addon-images/13/1750238598_product_other_5993_1635223323.jpg" -o "$OUT_DIR/lantern-decor.jpg"
curl -sL "$BASE_URL/addon-images/13/1750239182_1000108638-scaled-1.jpg" -o "$OUT_DIR/ceiling-balloons.jpg"
curl -sL "$BASE_URL/addon-images/13/1750239310_il_570xN.6384516133_qqz7.jpg" -o "$OUT_DIR/printed-photo-hangings.jpg"

echo ""
echo "Done! Downloaded to $OUT_DIR/"
echo ""
ls -la "$OUT_DIR/" | wc -l
echo "files downloaded"
