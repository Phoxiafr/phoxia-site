/* =============================================================
   Minubu : la carte (source : Menu Minubu, janvier 2026)
   Prix en centimes. Ce fichier est lu par le navigateur ET par la
   fonction de paiement côté serveur, qui recalcule chaque total :
   un prix modifié dans le navigateur n'est jamais facturé.

   Allergènes : indicatifs, déduits des recettes. À faire valider
   par l'équipe avant la mise en ligne.
   ============================================================= */
(function (racine) {
  'use strict';

  /* ---------- Options réutilisables ---------- */
  var LAIT = {
    id: 'lait', type: 'unique', requis: true,
    label: { fr: 'Lait', en: 'Milk' },
    choix: [
      { id: 'vache', label: { fr: 'Lait de vache', en: 'Cow milk' }, prix: 0 },
      { id: 'avoine', label: { fr: 'Avoine', en: 'Oat' }, prix: 50 },
      { id: 'coco', label: { fr: 'Coco', en: 'Coconut' }, prix: 50 }
    ]
  };
  var TEMPERATURE = {
    id: 'temp', type: 'unique', requis: true,
    label: { fr: 'Température', en: 'Temperature' },
    choix: [
      { id: 'chaud', label: { fr: 'Chaud', en: 'Hot' }, prix: 0 },
      { id: 'froid', label: { fr: 'Glacé', en: 'Iced' }, prix: 0 }
    ]
  };
  var SUCRE = {
    id: 'sucre', type: 'unique', requis: false,
    label: { fr: 'Sucre', en: 'Sugar' },
    choix: [
      { id: 'normal', label: { fr: 'Sucré normalement', en: 'Regular' }, prix: 0 },
      { id: 'peu', label: { fr: 'Peu sucré', en: 'Lightly sweet' }, prix: 0 },
      { id: 'sans', label: { fr: 'Sans sucre', en: 'No sugar' }, prix: 0 }
    ]
  };
  var PAIN_SG = {
    id: 'pain', type: 'unique', requis: true,
    label: { fr: 'Pain', en: 'Bread' },
    choix: [
      { id: 'levain', label: { fr: 'Pain au levain', en: 'Sourdough' }, prix: 0 },
      { id: 'sg', label: { fr: 'Pain sans gluten maison', en: 'House gluten-free bread' }, prix: 100 }
    ]
  };
  var EXTRAS = {
    id: 'extras', type: 'multiple', requis: false,
    label: { fr: 'Extras', en: 'Extras' },
    choix: [
      { id: 'saumon', label: { fr: 'Saumon fumé', en: 'Smoked salmon' }, prix: 450 },
      { id: 'avocat', label: { fr: 'Purée d’avocat', en: 'Smashed avocado' }, prix: 350 },
      { id: 'feta', label: { fr: 'Fêta', en: 'Feta' }, prix: 290 },
      { id: 'oeufs', label: { fr: '2 œufs pochés', en: '2 poached eggs' }, prix: 350 },
      { id: 'bacon', label: { fr: 'Bacon de bœuf', en: 'Beef bacon' }, prix: 450 },
      { id: 'pdt', label: { fr: 'Pommes de terre sautées', en: 'Sautéed potatoes' }, prix: 550 }
    ]
  };

  /* ---------- Catégories ---------- */
  var CATEGORIES = [
    { id: 'oeufs', cuisine: true, art: 'toast', label: { fr: 'Œufs & Toasts', en: 'Eggs & Toasts' },
      note: { fr: 'Pain sans gluten maison (+1,00 €)', en: 'House gluten-free bread (+€1.00)' } },
    { id: 'cassecroute', cuisine: true, art: 'bagel', label: { fr: 'Casse-croûtes', en: 'Sandwiches' } },
    { id: 'sucre', cuisine: true, art: 'pancake', label: { fr: 'Sucré', en: 'Sweet' } },
    { id: 'extras', cuisine: true, art: 'plate', label: { fr: 'Extras', en: 'Sides' } },
    { id: 'lattebar', cuisine: false, art: 'latte', label: { fr: 'Latte bar', en: 'Latte bar' },
      note: { fr: 'Laits végétaux (+0,50 €) : avoine, coco', en: 'Plant milks (+€0.50): oat, coconut' } },
    { id: 'cafes', cuisine: false, art: 'cup', label: { fr: 'Cafés & infusions', en: 'Coffees & teas' },
      note: { fr: 'Chaud ou froid. Laits végétaux (+0,50 €) : avoine, coco', en: 'Hot or iced. Plant milks (+€0.50): oat, coconut' } },
    { id: 'jus', cuisine: false, art: 'glass', label: { fr: 'Jus frais', en: 'Fresh juices' } },
    { id: 'fraiches', cuisine: false, art: 'bottle', label: { fr: 'Boissons fraîches', en: 'Soft drinks' } }
  ];

  /* ---------- Produits ----------
     tags : veg (végétarien), new, sg (option sans gluten), pimente,
            boisson (compte pour la fidélité), vegetal (lait végétal possible)
     couleur : teinte de la boisson, utilisée par l'atelier latte. */
  var P = [
    /* Œufs & Toasts */
    { id: 'benedicte', cat: 'oeufs', prix: 1550, signature: true,
      nom: { fr: 'Œufs Bénédicte', en: 'Eggs Benedict' },
      desc: { fr: 'Œufs pochés et sauce hollandaise en sabayon, sur pain au levain et sauce vierge orientale herbacée. 1 extra au choix : saumon fumé ou bacon de bœuf.',
              en: 'Poached eggs and sabayon-style hollandaise on sourdough with a herby oriental sauce vierge. One topping of your choice: smoked salmon or beef bacon.' },
      tags: ['sg'], allergenes: ['gluten', 'oeufs', 'lait', 'poisson'],
      options: [
        { id: 'garniture', type: 'unique', requis: true,
          label: { fr: 'Extra inclus', en: 'Included topping' },
          choix: [
            { id: 'saumon', label: { fr: 'Saumon fumé', en: 'Smoked salmon' }, prix: 0 },
            { id: 'bacon', label: { fr: 'Bacon de bœuf', en: 'Beef bacon' }, prix: 0 }
          ] },
        PAIN_SG, EXTRAS] },
    { id: 'avocado', cat: 'oeufs', prix: 1490,
      nom: { fr: 'Avocado toast & œufs pochés', en: 'Avocado toast & poached eggs' },
      desc: { fr: 'Œufs pochés, fêta et purée d’avocat, sur un toast de pain au levain grillé.',
              en: 'Poached eggs, feta and smashed avocado on toasted sourdough.' },
      tags: ['veg', 'sg'], allergenes: ['gluten', 'oeufs', 'lait'], options: [PAIN_SG, EXTRAS] },
    { id: 'turkish', cat: 'oeufs', prix: 1390, signature: true,
      nom: { fr: 'Turkish eggs', en: 'Turkish eggs' },
      desc: { fr: 'Œufs pochés coulants sur un yaourt grec citronné, des herbes aromatiques et une huile pimentée maison aux arachides. Le tout servi avec du pain grillé.',
              en: 'Runny poached eggs on lemony Greek yoghurt with fresh herbs and a house peanut chilli oil. Served with toasted bread.' },
      tags: ['veg', 'sg', 'pimente'], allergenes: ['gluten', 'oeufs', 'lait', 'arachides'], options: [PAIN_SG, EXTRAS] },
    { id: 'champignon', cat: 'oeufs', prix: 1390,
      nom: { fr: 'Tartine champignon', en: 'Mushroom toast' },
      desc: { fr: 'Crème de labneh, champignons sautés, houmous de petits pois mentholé relevé par une émulsion harissa, le tout servi sur du pain au levain.',
              en: 'Labneh cream, sautéed mushrooms, minty pea hummus lifted with a harissa emulsion, on sourdough.' },
      tags: ['veg', 'sg'], allergenes: ['gluten', 'lait', 'sesame'], options: [PAIN_SG, EXTRAS] },
    { id: 'betterave', cat: 'oeufs', prix: 1390, signature: true,
      nom: { fr: 'Tartine houmous de betterave', en: 'Beetroot hummus toast' },
      desc: { fr: 'Houmous de betterave, fêta émiettée, bacon de bœuf grillé, carottes marinées à l’huile d’olive et miel, pickles d’oignon rouge, coriandre, le tout servi sur du pain au levain.',
              en: 'Beetroot hummus, crumbled feta, grilled beef bacon, carrots marinated in olive oil and honey, pickled red onion and coriander, on sourdough.' },
      tags: ['new', 'sg'], allergenes: ['gluten', 'lait', 'sesame'], options: [PAIN_SG, EXTRAS] },

    /* Casse-croûtes */
    { id: 'bagel', cat: 'cassecroute', prix: 1300,
      nom: { fr: 'Bagel saumon', en: 'Salmon bagel' },
      desc: { fr: 'Saumon fumé, cream cheese, avocat et ciboulette.', en: 'Smoked salmon, cream cheese, avocado and chives.' },
      tags: [], allergenes: ['gluten', 'lait', 'poisson'], options: [EXTRAS] },
    { id: 'shawarma', cat: 'cassecroute', prix: 1250,
      nom: { fr: 'Chicken shawarma', en: 'Chicken shawarma' },
      desc: { fr: 'Poulet délicatement mariné aux épices orientales et à la pâte d’ail, houmous, pickles maison, tomates et chou rouge croquant, enveloppés dans une galette de blé.',
              en: 'Chicken gently marinated in oriental spices and garlic paste, hummus, house pickles, tomato and crunchy red cabbage, wrapped in a wheat flatbread.' },
      tags: [], allergenes: ['gluten', 'sesame'], options: [EXTRAS] },

    /* Sucré */
    { id: 'pancakes', cat: 'sucre', prix: 1190, signature: true,
      nom: { fr: 'Pancakes pistache', en: 'Pistachio pancakes' },
      desc: { fr: '2 pancakes moelleux nappés d’une crème onctueuse montée à la pistache, parsemés d’éclats de pistaches.',
              en: 'Two fluffy pancakes topped with a silky whipped pistachio cream and crushed pistachios.' },
      tags: ['veg'], allergenes: ['gluten', 'oeufs', 'lait', 'fruits_coque'] },
    { id: 'frenchtoast', cat: 'sucre', prix: 1190,
      nom: { fr: 'French toast', en: 'French toast' },
      desc: { fr: 'Brioche façon pain perdu, nappée d’une crème montée et garnie de fruits rouges frais, avec une touche de menthe.',
              en: 'Brioche French toast with whipped cream, fresh red berries and a touch of mint.' },
      tags: ['veg'], allergenes: ['gluten', 'oeufs', 'lait'] },
    { id: 'granola', cat: 'sucre', prix: 1250,
      nom: { fr: 'Granola maison pistaches & amandes', en: 'House pistachio & almond granola' },
      desc: { fr: 'Servi avec du yaourt grec, des fruits rouges, un sirop maison de fleur d’oranger et du miel.',
              en: 'Served with Greek yoghurt, red berries, a house orange blossom syrup and honey.' },
      tags: ['veg'], allergenes: ['gluten', 'lait', 'fruits_coque'] },

    /* Extras vendus seuls */
    { id: 'x-saumon', cat: 'extras', prix: 450, nom: { fr: 'Saumon fumé', en: 'Smoked salmon' }, tags: [], allergenes: ['poisson'] },
    { id: 'x-avocat', cat: 'extras', prix: 350, nom: { fr: 'Purée d’avocat', en: 'Smashed avocado' }, tags: ['veg'], allergenes: [] },
    { id: 'x-feta', cat: 'extras', prix: 290, nom: { fr: 'Fêta', en: 'Feta' }, tags: ['veg'], allergenes: ['lait'] },
    { id: 'x-oeufs', cat: 'extras', prix: 350, nom: { fr: '2 œufs pochés', en: '2 poached eggs' }, tags: ['veg'], allergenes: ['oeufs'] },
    { id: 'x-bacon', cat: 'extras', prix: 450, nom: { fr: 'Bacon de bœuf', en: 'Beef bacon' }, tags: [], allergenes: [] },
    { id: 'x-pdt', cat: 'extras', prix: 550, nom: { fr: 'Pommes de terre sautées', en: 'Sautéed potatoes' }, tags: ['veg'], allergenes: [] },
    { id: 'x-houmous', cat: 'extras', prix: 550, nom: { fr: 'Houmous servi avec pain du jour', en: 'Hummus with bread of the day' }, tags: ['veg'], allergenes: ['gluten', 'sesame'] },

    /* Latte bar */
    { id: 'turmeric', cat: 'lattebar', prix: 550, couleur: '#E9A93A',
      nom: { fr: 'Turmeric latte', en: 'Turmeric latte' },
      desc: { fr: 'Curcuma, gingembre, cannelle, miel, pointe de poivre et lait au choix.', en: 'Turmeric, ginger, cinnamon, honey, a hint of pepper and your choice of milk.' },
      tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT] },
    { id: 'pistachio', cat: 'lattebar', prix: 550, couleur: '#A9B86A', signature: true,
      nom: { fr: 'Pistachio latte', en: 'Pistachio latte' },
      desc: { fr: 'Crème de pistache, sirop de pistache, shot d’espresso et lait au choix.', en: 'Pistachio cream, pistachio syrup, a shot of espresso and your choice of milk.' },
      tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait', 'fruits_coque'], options: [TEMPERATURE, LAIT] },
    { id: 'peanut', cat: 'lattebar', prix: 550, couleur: '#B9825A',
      nom: { fr: 'Peanut butter latte', en: 'Peanut butter latte' },
      desc: { fr: 'Beurre de cacahuète, caramel, shot d’espresso et lait au choix.', en: 'Peanut butter, caramel, a shot of espresso and your choice of milk.' },
      tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait', 'arachides'], options: [TEMPERATURE, LAIT] },
    { id: 'tahini', cat: 'lattebar', prix: 550, couleur: '#C9A27E',
      nom: { fr: 'Tahini latte', en: 'Tahini latte' },
      desc: { fr: 'Tahiné, miel, shot d’espresso et lait au choix.', en: 'Tahini, honey, a shot of espresso and your choice of milk.' },
      tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait', 'sesame'], options: [TEMPERATURE, LAIT] },

    /* Cafés & infusions */
    { id: 'espresso', cat: 'cafes', prix: 200, couleur: '#3B1F14',
      nom: { fr: 'Ristretto / Espresso', en: 'Ristretto / Espresso' }, tags: ['veg', 'boisson'], allergenes: [],
      options: [{ id: 'extraction', type: 'unique', requis: true, label: { fr: 'Extraction', en: 'Shot' },
        choix: [{ id: 'espresso', label: { fr: 'Espresso', en: 'Espresso' }, prix: 0 }, { id: 'ristretto', label: { fr: 'Ristretto', en: 'Ristretto' }, prix: 0 }] }] },
    { id: 'double', cat: 'cafes', prix: 350, couleur: '#3B1F14', nom: { fr: 'Double espresso', en: 'Double espresso' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'americano', cat: 'cafes', prix: 250, couleur: '#4A2A1C', nom: { fr: 'Americano', en: 'Americano' }, tags: ['veg', 'boisson'], allergenes: [], options: [TEMPERATURE] },
    { id: 'noisette', cat: 'cafes', prix: 350, couleur: '#7A4A30', nom: { fr: 'Noisette', en: 'Macchiato (noisette)' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [LAIT] },
    { id: 'tonique', cat: 'cafes', prix: 390, couleur: '#8C5A3A', nom: { fr: 'Café tonique', en: 'Espresso tonic' },
      desc: { fr: 'Espresso versé sur tonic et glaçons.', en: 'Espresso poured over tonic and ice.' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'flatwhite', cat: 'cafes', prix: 500, couleur: '#B08060', nom: { fr: 'Flat white', en: 'Flat white' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT] },
    { id: 'latte', cat: 'cafes', prix: 500, couleur: '#C49A74', nom: { fr: 'Café latte / Cappuccino', en: 'Caffè latte / Cappuccino' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'],
      options: [{ id: 'style', type: 'unique', requis: true, label: { fr: 'Style', en: 'Style' },
        choix: [{ id: 'latte', label: { fr: 'Café latte', en: 'Caffè latte' }, prix: 0 }, { id: 'cappuccino', label: { fr: 'Cappuccino', en: 'Cappuccino' }, prix: 0 }] }, TEMPERATURE, LAIT] },
    { id: 'chai', cat: 'cafes', prix: 450, couleur: '#C08A5C', nom: { fr: 'Chai latte', en: 'Chai latte' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT, SUCRE] },
    { id: 'chocolat', cat: 'cafes', prix: 500, couleur: '#6B3A26', nom: { fr: 'Chocolat chaud', en: 'Hot chocolate' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT] },
    { id: 'macchiato', cat: 'cafes', prix: 550, couleur: '#D2AE88', nom: { fr: 'Latte macchiato', en: 'Latte macchiato' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT] },
    { id: 'matcha', cat: 'cafes', prix: 550, couleur: '#8DB36B', signature: true, nom: { fr: 'Matcha latte', en: 'Matcha latte' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT, SUCRE] },
    { id: 'ube', cat: 'cafes', prix: 550, couleur: '#9B7BC4', signature: true, nom: { fr: 'Ube latte', en: 'Ube latte' },
      desc: { fr: 'L’igname violette des Philippines, douce et vanillée.', en: 'Purple yam from the Philippines, mellow and vanilla-like.' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT, SUCRE] },
    { id: 'blue', cat: 'cafes', prix: 550, couleur: '#6FA3D8', nom: { fr: 'Blue latte', en: 'Blue latte' },
      desc: { fr: 'Aromatisé au sirop de vanille.', en: 'Flavoured with vanilla syrup.' }, tags: ['veg', 'boisson', 'vegetal'], allergenes: ['lait'], options: [TEMPERATURE, LAIT] },
    { id: 'matchalimo', cat: 'cafes', prix: 600, couleur: '#B6D37A', nom: { fr: 'Matcha limonade', en: 'Matcha lemonade' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'the', cat: 'cafes', prix: 300, couleur: '#C98E4B', nom: { fr: 'Thé', en: 'Tea' }, tags: ['veg', 'boisson'], allergenes: [],
      options: [{ id: 'parfum', type: 'unique', requis: true, label: { fr: 'Parfum', en: 'Blend' },
        choix: [{ id: 'menthe', label: { fr: 'Menthe', en: 'Mint' }, prix: 0 }, { id: 'jasmin', label: { fr: 'Jasmin', en: 'Jasmine' }, prix: 0 },
                { id: 'thym', label: { fr: 'Thym citron', en: 'Lemon thyme' }, prix: 0 }, { id: 'earlgrey', label: { fr: 'Earl grey', en: 'Earl grey' }, prix: 0 }] }, TEMPERATURE] },
    { id: 'cascara', cat: 'cafes', prix: 400, couleur: '#B5503A', nom: { fr: 'Cascara', en: 'Cascara' },
      desc: { fr: 'Infusion de cerise de café séchée, fruitée et légère.', en: 'Infusion of dried coffee cherry, light and fruity.' }, tags: ['veg', 'boisson'], allergenes: [], options: [TEMPERATURE] },

    /* Jus frais */
    { id: 'jusgingembre', cat: 'jus', prix: 600, couleur: '#C7D46A', nom: { fr: 'Jus frais gingembre, citron, pomme verte', en: 'Fresh ginger, lemon & green apple juice' }, tags: ['veg', 'new', 'boisson'], allergenes: [] },
    { id: 'agrumade', cat: 'jus', prix: 500, couleur: '#F2B544', nom: { fr: 'Agrumade maison', en: 'House citrus lemonade' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'theglace', cat: 'jus', prix: 500, couleur: '#D08B4F', nom: { fr: 'Thé glacé maison', en: 'House iced tea' }, tags: ['veg', 'boisson'], allergenes: [] },

    /* Boissons fraîches */
    { id: 'coca', cat: 'fraiches', prix: 380, couleur: '#4A1D14', nom: { fr: 'Coca-Cola / Coca-Cola Zero', en: 'Coca-Cola / Coke Zero' }, tags: ['veg', 'boisson'], allergenes: [],
      options: [{ id: 'version', type: 'unique', requis: true, label: { fr: 'Version', en: 'Version' },
        choix: [{ id: 'classique', label: { fr: 'Classique', en: 'Classic' }, prix: 0 }, { id: 'zero', label: { fr: 'Zero', en: 'Zero' }, prix: 0 }] }] },
    { id: 'orangina', cat: 'fraiches', prix: 380, couleur: '#F2A23A', nom: { fr: 'Orangina', en: 'Orangina' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'gingerbeer', cat: 'fraiches', prix: 410, couleur: '#D9B45A', nom: { fr: 'Ginger beer', en: 'Ginger beer' }, tags: ['veg', 'boisson'], allergenes: [] },
    { id: 'perrier', cat: 'fraiches', prix: 300, couleur: '#BFE0D0', nom: { fr: 'Perrier', en: 'Perrier' }, tags: ['veg', 'boisson'], allergenes: [] }
  ];

  var ALLERGENES = {
    gluten: { fr: 'Gluten', en: 'Gluten' },
    oeufs: { fr: 'Œufs', en: 'Eggs' },
    lait: { fr: 'Lait', en: 'Milk' },
    arachides: { fr: 'Arachides', en: 'Peanuts' },
    fruits_coque: { fr: 'Fruits à coque', en: 'Tree nuts' },
    poisson: { fr: 'Poisson', en: 'Fish' },
    sesame: { fr: 'Sésame', en: 'Sesame' }
  };

  /* Carte cadeau : produit virtuel, montant libre borné par la config. */
  var CARTE_CADEAU = { id: 'carte-cadeau', cat: 'cadeau', prix: 0,
    nom: { fr: 'Carte cadeau Minubu', en: 'Minubu gift card' }, tags: [], allergenes: [] };

  var parId = {};
  P.forEach(function (p) { parId[p.id] = p; });
  parId[CARTE_CADEAU.id] = CARTE_CADEAU;

  /* Calcule le prix unitaire d'une ligne à partir des choix.
     Utilisé à l'identique côté navigateur et côté serveur. */
  function prixLigne(produit, choix, montantCadeau, config) {
    if (produit.id === CARTE_CADEAU.id) {
      var m = Math.round(Number(montantCadeau) || 0);
      var bornes = (config && config.cartesCadeaux) || { min: 1000, max: 30000 };
      if (m < bornes.min || m > bornes.max) throw new Error('Montant de carte cadeau invalide');
      return m;
    }
    var total = produit.prix;
    (produit.options || []).forEach(function (opt) {
      var valeur = choix ? choix[opt.id] : undefined;
      var ids = opt.type === 'multiple' ? (Array.isArray(valeur) ? valeur : []) : (valeur ? [valeur] : []);
      if (opt.requis && opt.type === 'unique' && ids.length === 0) throw new Error('Option manquante : ' + opt.id);
      ids.forEach(function (id) {
        var c = opt.choix.filter(function (x) { return x.id === id; })[0];
        if (!c) throw new Error('Choix inconnu : ' + opt.id + '/' + id);
        total += c.prix;
      });
    });
    return total;
  }

  var MENU = {
    categories: CATEGORIES,
    produits: P,
    parId: parId,
    allergenes: ALLERGENES,
    carteCadeau: CARTE_CADEAU,
    prixLigne: prixLigne
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = MENU; }
  else { racine.MINUBU_MENU = MENU; }
})(typeof self !== 'undefined' ? self : this);
