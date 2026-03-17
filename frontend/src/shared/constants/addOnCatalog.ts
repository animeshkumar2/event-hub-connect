// Platform-level add-on catalog — vendors pick from this list
// Inspired by partyone.in's decoration add-on system

export interface CatalogAddOn {
  id: string;        // stable slug used as key
  title: string;
  category: string;
  defaultPrice: number;  // suggested price in ₹
  description?: string;
  imageUrl?: string;  // path to image in /addon-images/
}

export interface CatalogCategory {
  name: string;
  type: 'addon' | 'activity';  // maps to the two tabs
  items: CatalogAddOn[];
}

const img = (name: string) => `/addon-images/${name}`;

export const ADD_ON_CATALOG: CatalogCategory[] = [
  // ── Add-Ons ──
  {
    name: 'Entrance Arch',
    type: 'addon',
    items: [
      { id: 'rectangle-arch', title: 'Rectangle Arch', category: 'Entrance Arch', defaultPrice: 1499, description: '200 balloons, choice of colors', imageUrl: img('rectangle-arch.jpg') },
      { id: 'u-shaped-arch', title: 'U Shaped Entrance Arch', category: 'Entrance Arch', defaultPrice: 1499, description: '200 balloons, choice of colors', imageUrl: img('u-shaped-arch.jpg') },
      { id: 'l-shaped-arch', title: 'L Shaped Arch', category: 'Entrance Arch', defaultPrice: 899, description: '100 balloons, choice of colors', imageUrl: img('l-shaped-arch.jpg') },
      { id: 'curve-arch', title: 'Curve Arch', category: 'Entrance Arch', defaultPrice: 899, description: '100 balloons, choice of colors', imageUrl: img('curve-arch.jpg') },
    ],
  },
  {
    name: 'Cake Tables',
    type: 'addon',
    items: [
      { id: 'cylindrical-cake-table', title: '1 Cylindrical Cake Table', category: 'Cake Tables', defaultPrice: 499, description: 'Cylindrical cake table rental', imageUrl: img('cylindrical-cake-table.jpg') },
      { id: 'iron-cake-table', title: '1 Iron Cake Table', category: 'Cake Tables', defaultPrice: 499, description: 'Iron cake table rental', imageUrl: img('iron-cake-table.jpg') },
      { id: 'paper-cake-table', title: '1 Paper Cake Table', category: 'Cake Tables', defaultPrice: 499, description: 'Paper cake table rental', imageUrl: img('paper-cake-table.jpg') },
      { id: 'cylindrical-cake-table-set', title: 'Cylindrical Cake Table Set', category: 'Cake Tables', defaultPrice: 1399, description: 'Set of cylindrical cake tables', imageUrl: img('cylindrical-cake-table-set.jpg') },
      { id: 'paper-cake-table-set', title: 'Paper Cake Table Set', category: 'Cake Tables', defaultPrice: 1399, description: 'Set of paper cake tables', imageUrl: img('paper-cake-table-set.jpg') },
      { id: 'cake-table-theme-flex', title: 'Cake Table with Theme Flex', category: 'Cake Tables', defaultPrice: 1799, description: 'Rounded cake table with theme flex', imageUrl: img('cake-table-theme-flex.jpg') },
    ],
  },
  {
    name: 'Foil Balloons (Alphabet & Digit)',
    type: 'addon',
    items: [
      { id: 'gold-alphabet-foil', title: 'Gold Alphabet Foil Balloons', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 39, description: 'Per letter', imageUrl: img('gold-alphabet-foil.jpg') },
      { id: 'gold-digit-foil', title: 'Gold Digit Foil Balloons', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 39, description: 'Per digit', imageUrl: img('gold-digit-foil.jpg') },
      { id: 'silver-alphabet-foil', title: 'Silver Alphabet Foil Balloons', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 39, description: 'Per letter', imageUrl: img('silver-alphabet-foil.jpg') },
      { id: 'silver-digit-foil', title: 'Silver Digit Foil Balloons', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 39, description: 'Per digit', imageUrl: img('silver-digit-foil.jpg') },
      { id: 'name-pillar', title: 'Baby Boy or Girl Name Pillar', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 499, imageUrl: img('baby-name-pillar.jpg') },
      { id: 'number-centerpiece', title: 'Number Centerpiece', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 89, imageUrl: img('number-centerpiece.jpg') },
      { id: 'number-balloon-pillar', title: 'Number Balloon Pillar', category: 'Foil Balloons (Alphabet & Digit)', defaultPrice: 289, imageUrl: img('number-balloon-pillar.jpg') },
    ],
  },
  {
    name: 'Foil Curtains',
    type: 'addon',
    items: [
      { id: 'silver-frill-curtains', title: 'Silver Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('silver-frill-curtains.jpg') },
      { id: 'gold-frill-curtains', title: 'Gold Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('gold-frill-curtains.jpg') },
      { id: 'rose-gold-frill-curtains', title: 'Rose Gold Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('rose-gold-frill-curtains.jpg') },
      { id: 'pink-frill-curtains', title: 'Pink Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('pink-frill-curtains.jpg') },
      { id: 'blue-frill-curtains', title: 'Blue Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('blue-frill-curtains.jpg') },
      { id: 'red-frill-curtains', title: 'Red Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('red-frill-curtains.jpg') },
      { id: 'green-frill-curtains', title: 'Green Frill Curtains', category: 'Foil Curtains', defaultPrice: 249, imageUrl: img('green-frill-curtains.jpg') },
    ],
  },
  {
    name: 'Shape Foil Balloons',
    type: 'addon',
    items: [
      { id: 'foil-balloons', title: 'Foil Balloons', category: 'Shape Foil Balloons', defaultPrice: 99, imageUrl: img('foil-balloons-assorted.jpg') },
      { id: '4d-foil-balloon', title: '4D Foil Balloon', category: 'Shape Foil Balloons', defaultPrice: 149, imageUrl: img('4d-foil-balloon.jpg') },
      { id: '5-star-golden-foil', title: '5 Star Golden Foil Balloons', category: 'Shape Foil Balloons', defaultPrice: 149, imageUrl: img('star-gold-foil.jpg') },
      { id: '5-star-silver-foil', title: '5 Star Silver Foil Balloons', category: 'Shape Foil Balloons', defaultPrice: 149, imageUrl: img('star-silver-foil.jpg') },
      { id: 'ring-foil-balloon', title: 'Ring Foil Balloon', category: 'Shape Foil Balloons', defaultPrice: 199, imageUrl: img('ring-foil-balloon.jpg') },
      { id: '2-heart-shape-foil', title: '2 Heart Shape Foil', category: 'Shape Foil Balloons', defaultPrice: 149, imageUrl: img('heart-shape-foil.jpg') },
    ],
  },
  {
    name: 'LED Lights & Candles',
    type: 'addon',
    items: [
      { id: 'name-letter-led', title: 'Name Letter LED', category: 'LED Lights & Candles', defaultPrice: 99, description: 'Per letter', imageUrl: img('name-letter-led.jpg') },
      { id: 'digit-led', title: 'Digit LED', category: 'LED Lights & Candles', defaultPrice: 99, description: 'Per digit', imageUrl: img('digit-led.jpg') },
      { id: 'fairy-lights', title: 'Fairy Lights', category: 'LED Lights & Candles', defaultPrice: 199, imageUrl: img('fairy-lights.jpg') },
      { id: 'led-candles', title: 'LED Candles', category: 'LED Lights & Candles', defaultPrice: 149, imageUrl: img('led-candles.jpg') },
      { id: 'focus-light', title: 'Focus Light', category: 'LED Lights & Candles', defaultPrice: 499, imageUrl: img('focus-light.jpg') },
      { id: '2-led-par-cams', title: '2 LED Par Cams', category: 'LED Lights & Candles', defaultPrice: 699, imageUrl: img('led-par-cams.jpg') },
    ],
  },
  {
    name: 'Occasion Foil Balloons',
    type: 'addon',
    items: [
      { id: 'happy-birthday-foil', title: 'Happy Birthday Foil Garland', category: 'Occasion Foil Balloons', defaultPrice: 149, imageUrl: img('happy-birthday-foil.jpg') },
      { id: 'happy-anniversary-foil', title: 'Happy Anniversary Foil Garland', category: 'Occasion Foil Balloons', defaultPrice: 149, imageUrl: img('happy-anniversary-foil.png') },
      { id: 'welcome-baby-foil', title: 'Welcome Baby Foil Garland', category: 'Occasion Foil Balloons', defaultPrice: 149, imageUrl: img('welcome-baby-foil.jpg') },
      { id: 'baby-shower-foil', title: 'Baby Shower Foil Garland', category: 'Occasion Foil Balloons', defaultPrice: 149, imageUrl: img('baby-shower-foil.jpg') },
      { id: 'naming-ceremony-foil', title: 'Naming Ceremony Foil Garland', category: 'Occasion Foil Balloons', defaultPrice: 149, imageUrl: img('naming-ceremony-foil.jpg') },
      { id: 'i-love-u-foils', title: 'I LOVE U Foils', category: 'Occasion Foil Balloons', defaultPrice: 199, imageUrl: img('i-love-u-foils.jpg') },
      { id: 'be-mine-foils', title: 'Be Mine Foils', category: 'Occasion Foil Balloons', defaultPrice: 199, imageUrl: img('be-mine-foils.webp') },
      { id: 'mr-mrs-foils', title: 'Mr & Mrs Foils', category: 'Occasion Foil Balloons', defaultPrice: 199, imageUrl: img('mr-ms-foils.jpg') },
      { id: 'red-love-cursive-foil', title: 'Red Love Cursive Foil', category: 'Occasion Foil Balloons', defaultPrice: 199, imageUrl: img('red-love-cursive-foil.jpg') },
    ],
  },
  {
    name: 'Occasion Buntings',
    type: 'addon',
    items: [
      { id: 'happy-birthday-bunting', title: 'Happy Birthday Bunting', category: 'Occasion Buntings', defaultPrice: 99, imageUrl: img('happy-birthday-bunting.jpg') },
      { id: 'happy-anniversary-bunting', title: 'Happy Anniversary Bunting', category: 'Occasion Buntings', defaultPrice: 99, imageUrl: img('happy-anniversary-bunting.jpg') },
      { id: 'welcome-baby-bunting', title: 'Welcome Baby Bunting', category: 'Occasion Buntings', defaultPrice: 99, imageUrl: img('welcome-baby-bunting.jpg') },
      { id: 'babyshower-bunting', title: 'Baby Shower Bunting', category: 'Occasion Buntings', defaultPrice: 99, imageUrl: img('baby-shower-bunting.jpg') },
      { id: 'naming-ceremony-bunting', title: 'Naming Ceremony Bunting', category: 'Occasion Buntings', defaultPrice: 99, imageUrl: img('naming-ceremony-bunting.jpg') },
    ],
  },
  {
    name: 'Stands',
    type: 'addon',
    items: [
      { id: '6x6-stand', title: '6x6 Stand', category: 'Stands', defaultPrice: 999, imageUrl: img('stand-6x6.jpg') },
      { id: '8x8-stand', title: '8x8 Stand', category: 'Stands', defaultPrice: 1499, imageUrl: img('stand-8x8.jpg') },
    ],
  },
  {
    name: 'Ceiling Decor',
    type: 'addon',
    items: [
      { id: '40-ceiling-balloons', title: '40 Ceiling Balloons', category: 'Ceiling Decor', defaultPrice: 499, imageUrl: img('ceiling-balloons.jpg') },
      { id: 'lantern-decor', title: 'Lantern Decor', category: 'Ceiling Decor', defaultPrice: 399, imageUrl: img('lantern-decor.jpg') },
      { id: '12-printed-photo-hangings', title: '12 Printed Photo Hangings', category: 'Ceiling Decor', defaultPrice: 599, imageUrl: img('printed-photo-hangings.jpg') },
    ],
  },
  {
    name: 'Photography',
    type: 'addon',
    items: [
      { id: 'photography', title: 'Photography', category: 'Photography', defaultPrice: 2999, imageUrl: img('photography.jpg') },
      { id: 'candid-photography', title: 'Candid Photography for Parties', category: 'Photography', defaultPrice: 4999, imageUrl: img('candid-photography.jpg') },
      { id: 'traditional-photo-video', title: 'Traditional Photography & Short Videography', category: 'Photography', defaultPrice: 5999, imageUrl: img('traditional-photo-video.jpg') },
      { id: 'candid-videography', title: 'Candid Videography for Parties', category: 'Photography', defaultPrice: 5999, imageUrl: img('candid-videography.jpg') },
      { id: 'traditional-videography', title: 'Traditional Videography for Parties', category: 'Photography', defaultPrice: 3999, imageUrl: img('traditional-videography.jpg') },
    ],
  },

  // ── Activities ──
  {
    name: 'Fun Entertainers',
    type: 'activity',
    items: [
      { id: 'magician', title: 'Magician', category: 'Fun Entertainers', defaultPrice: 2999, imageUrl: img('magician.jpg') },
      { id: 'joker', title: 'Joker', category: 'Fun Entertainers', defaultPrice: 2499, imageUrl: img('joker.jpg') },
      { id: 'puppet-show', title: 'Puppet Show', category: 'Fun Entertainers', defaultPrice: 3499, imageUrl: img('puppet-show.jpg') },
      { id: 'balloon-sculptor', title: 'Balloon Sculptor', category: 'Fun Entertainers', defaultPrice: 2999, imageUrl: img('balloon-sculptor.jpg') },
      { id: 'juggler', title: 'Juggler', category: 'Fun Entertainers', defaultPrice: 2999, imageUrl: img('juggler.jpg') },
      { id: 'stilt-walkers', title: 'Stilt Walkers', category: 'Fun Entertainers', defaultPrice: 3499, imageUrl: img('stilt-walkers.jpg') },
      { id: 'anchoring', title: 'Anchoring', category: 'Fun Entertainers', defaultPrice: 4999, imageUrl: img('anchoring.jpg') },
      { id: 'game-host', title: 'Game Host', category: 'Fun Entertainers', defaultPrice: 3499, imageUrl: img('game-host.jpg') },
    ],
  },
  {
    name: 'Fun Party Artists',
    type: 'activity',
    items: [
      { id: 'face-painting', title: 'Face Painting', category: 'Fun Party Artists', defaultPrice: 2499, imageUrl: img('face-painting.jpg') },
      { id: 'tattoo', title: 'Tattoo', category: 'Fun Party Artists', defaultPrice: 1999, imageUrl: img('tattoo.jpg') },
      { id: 'caricature', title: 'Caricature', category: 'Fun Party Artists', defaultPrice: 2999, imageUrl: img('caricature.jpg') },
      { id: 'digital-caricature', title: 'Digital Caricature Artist', category: 'Fun Party Artists', defaultPrice: 3499, imageUrl: img('digital-caricature.jpg') },
      { id: 'mug-caricature', title: 'Mug Caricature Artist', category: 'Fun Party Artists', defaultPrice: 3999, imageUrl: img('mug-caricature.jpg') },
      { id: 'mehandi', title: 'Mehandi', category: 'Fun Party Artists', defaultPrice: 1999, imageUrl: img('mehandi.jpg') },
      { id: 'nail-art', title: 'Nail Art', category: 'Fun Party Artists', defaultPrice: 1999, imageUrl: img('nail-art.jpg') },
      { id: 'hair-beading', title: 'Hair Beading', category: 'Fun Party Artists', defaultPrice: 1999, imageUrl: img('hair-beading.jpg') },
    ],
  },
  {
    name: 'Kids Craft Activities',
    type: 'activity',
    items: [
      { id: 'clay-modelling', title: 'Clay Modelling', category: 'Kids Craft Activities', defaultPrice: 2499, imageUrl: img('clay-modelling.jpg') },
      { id: 'canvas-painting', title: 'Canvas Painting', category: 'Kids Craft Activities', defaultPrice: 2499, imageUrl: img('canvas-painting.jpg') },
      { id: 'pottery', title: 'Pottery', category: 'Kids Craft Activities', defaultPrice: 2999, imageUrl: img('pottery.jpg') },
      { id: 'slime-art', title: 'Slime Art', category: 'Kids Craft Activities', defaultPrice: 1999, imageUrl: img('slime-art.jpg') },
      { id: 'pebble-painting', title: 'Pebble Stone Painting', category: 'Kids Craft Activities', defaultPrice: 1999, imageUrl: img('pebble-painting.jpg') },
      { id: 'key-chain-making', title: 'Key Chain Making', category: 'Kids Craft Activities', defaultPrice: 1999, imageUrl: img('key-chain-making.jpg') },
      { id: 'arts-crafts-corner', title: 'Arts & Crafts Corner', category: 'Kids Craft Activities', defaultPrice: 2999, imageUrl: img('arts-crafts-corner.jpg') },
    ],
  },
  {
    name: 'Game Stalls',
    type: 'activity',
    items: [
      { id: 'balloon-shooting', title: 'Balloon Shooting', category: 'Game Stalls', defaultPrice: 1999, imageUrl: img('balloon-shooting.jpg') },
      { id: 'ring-toss', title: 'Ring Toss Game', category: 'Game Stalls', defaultPrice: 1499, imageUrl: img('ring-toss.jpg') },
      { id: 'giant-jenga', title: 'Giant Jenga Game', category: 'Game Stalls', defaultPrice: 1999, imageUrl: img('giant-jenga.jpg') },
      { id: 'mini-golf', title: 'Mini Golf Game', category: 'Game Stalls', defaultPrice: 2499, imageUrl: img('mini-golf.jpg') },
      { id: 'mini-bowling', title: 'Mini Bowling Alley', category: 'Game Stalls', defaultPrice: 1999, imageUrl: img('mini-bowling.jpg') },
      { id: 'foosball', title: 'Foosball Game', category: 'Game Stalls', defaultPrice: 1999, imageUrl: img('foosball.jpg') },
    ],
  },
  {
    name: 'Live Eateries',
    type: 'activity',
    items: [
      { id: 'cotton-candy', title: 'Cotton Candy', category: 'Live Eateries', defaultPrice: 2499, imageUrl: img('cotton-candy.jpg') },
      { id: 'popcorn', title: 'Popcorn', category: 'Live Eateries', defaultPrice: 1999, imageUrl: img('popcorn.jpg') },
      { id: 'ice-gola', title: 'Ice Gola', category: 'Live Eateries', defaultPrice: 1999, imageUrl: img('ice-gola.jpg') },
      { id: 'chocolate-fountain', title: 'Chocolate Fountain', category: 'Live Eateries', defaultPrice: 3499, imageUrl: img('chocolate-fountain.jpg') },
      { id: 'potato-twister', title: 'Potato Twister', category: 'Live Eateries', defaultPrice: 2499, imageUrl: img('potato-twister.jpg') },
    ],
  },
  {
    name: 'Kids Play Rentals',
    type: 'activity',
    items: [
      { id: 'bouncing-castle', title: 'Bouncing Castle', category: 'Kids Play Rentals', defaultPrice: 3999, imageUrl: img('bouncing-castle.jpg') },
      { id: 'ball-pool-slider', title: 'Ball Pool with Slider', category: 'Kids Play Rentals', defaultPrice: 3499, imageUrl: img('ball-pool-slider.jpg') },
      { id: 'bubble-house', title: 'Bubble House with Balloons', category: 'Kids Play Rentals', defaultPrice: 4999, imageUrl: img('bubble-house.jpg') },
      { id: 'track-train-ride', title: 'Track Train Ride', category: 'Kids Play Rentals', defaultPrice: 5999, imageUrl: img('track-train-ride.jpg') },
    ],
  },
];

// Flat lookup helpers
export const ALL_CATALOG_ITEMS = ADD_ON_CATALOG.flatMap(c => c.items);
export const CATALOG_BY_ID = new Map(ALL_CATALOG_ITEMS.map(i => [i.id, i]));
