export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  excerpt: string;
  date: string;
  readTime: string;
  sections: { heading: string | null; paragraphs: string[] }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'lavage-domicile-solution-pratique',
    title: 'Le lavage à domicile : la solution pratique pour les conducteurs pressés',
    category: 'Pratique',
    categoryColor: '#059669',
    categoryBg: '#ecfdf5',
    excerpt: 'Entre le travail, les rendez-vous et les trajets du quotidien, il n\'est pas toujours simple de trouver du temps pour entretenir sa voiture. Le lavage à domicile change tout.',
    date: '10 Avr 2026',
    readTime: '8 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Entre le travail, les rendez-vous, les trajets du quotidien et les imprévus, il n\'est pas toujours simple de trouver du temps pour entretenir sa voiture. Pourtant, rouler dans un véhicule propre change tout. L\'extérieur renvoie une meilleure image, l\'intérieur devient plus agréable, et l\'on prend davantage soin de son véhicule sur le long terme.',
          'C\'est précisément là que le lavage à domicile prend tout son sens. Au lieu de perdre du temps sur la route, dans une station de lavage ou dans une file d\'attente, le service vient directement à vous. Que vous soyez à la maison, au bureau ou sur votre lieu de travail, vous pouvez faire nettoyer votre véhicule pendant que vous vous concentrez sur autre chose.',
        ]
      },
      {
        heading: 'Pourquoi laver sa voiture devient souvent une corvée',
        paragraphs: [
          'Dans l\'idéal, tout le monde aimerait garder sa voiture propre toute l\'année. En pratique, c\'est une autre histoire. Après quelques jours seulement, la poussière s\'accumule, les traces apparaissent, les tapis se salissent et l\'habitacle commence à donner une impression de désordre.',
          'Le vrai problème n\'est pas le nettoyage en lui-même. Ce qui bloque le plus souvent, c\'est tout ce qu\'il y a autour. Il faut prévoir un créneau, se déplacer jusqu\'à une station, attendre parfois qu\'une place se libère. Pour beaucoup de personnes, cette organisation devient vite décourageante.',
        ]
      },
      {
        heading: 'Une solution qui s\'adapte au rythme de vie moderne',
        paragraphs: [
          'Aujourd\'hui, de nombreux services ont évolué pour s\'adapter au rythme des gens. On se fait livrer à manger, on travaille à distance, on réserve en ligne en quelques secondes. Dans cette logique, il était normal que le lavage auto évolue lui aussi.',
          'Le lavage à domicile répond exactement à cette attente. Au lieu d\'imposer au client un déplacement et une contrainte supplémentaire, il s\'intègre à son quotidien. C\'est le service qui se déplace, et non l\'inverse. Cette simple différence change complètement l\'expérience.',
        ]
      },
      {
        heading: 'Les avantages concrets du lavage auto à domicile',
        paragraphs: [
          'Le premier avantage, évidemment, c\'est le gain de temps. Quand on choisit un service à domicile, on supprime tout ce qui fait perdre du temps dans un lavage classique : le trajet, l\'attente, l\'installation, le retour.',
          'Autre avantage important : la régularité. Quand le lavage devient plus accessible, on le fait plus facilement. Un véhicule propre n\'est pas seulement plus beau. Il est aussi plus agréable à utiliser au quotidien et conserve mieux sa valeur.',
        ]
      },
      {
        heading: 'Washapp : une réponse simple à un vrai besoin',
        paragraphs: [
          'C\'est précisément dans cette logique que s\'inscrit Washapp. L\'idée n\'est pas de compliquer davantage le quotidien des conducteurs, mais au contraire de le simplifier.',
          'Washapp répond à cette attente avec une approche moderne, pratique et centrée sur l\'utilisateur. Le service de lavage vient à vous, selon votre disponibilité, pour vous éviter les déplacements inutiles et vous faire gagner un temps précieux.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Le lavage à domicile s\'impose aujourd\'hui comme une solution évidente pour les conducteurs pressés. Il permet de gagner du temps, de réduire les contraintes, de conserver un véhicule propre plus régulièrement et de profiter d\'un service plus adapté à la réalité du quotidien.',
          'Avec Washapp, le lavage auto devient plus pratique, plus moderne et plus en phase avec les besoins d\'aujourd\'hui.',
        ]
      },
    ]
  },
  {
    slug: 'pourquoi-choisir-washapp',
    title: 'Pourquoi choisir Washapp pour le nettoyage de votre véhicule',
    category: 'Washapp',
    categoryColor: '#1558f5',
    categoryBg: '#eff6ff',
    excerpt: 'Faire nettoyer sa voiture ne devrait plus être compliqué. Washapp propose une manière plus moderne, plus pratique et plus fluide d\'entretenir votre véhicule.',
    date: '8 Avr 2026',
    readTime: '7 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Aujourd\'hui, faire nettoyer sa voiture ne devrait plus être compliqué. Pourtant, pour beaucoup de conducteurs, cela reste une tâche qu\'on repousse souvent. Entre le manque de temps, les déplacements jusqu\'aux stations de lavage, l\'attente et les autres priorités du quotidien, l\'entretien du véhicule passe facilement au second plan.',
          'C\'est précisément pour répondre à ce besoin que Washapp a été pensé. L\'idée est simple : proposer une manière plus moderne, plus pratique et plus fluide de faire nettoyer son véhicule.',
        ]
      },
      {
        heading: 'Un service pensé pour le quotidien réel des conducteurs',
        paragraphs: [
          'Washapp part d\'un constat simple : les conducteurs n\'ont pas besoin d\'un service de plus à gérer, ils ont besoin d\'un service qui leur enlève une contrainte. C\'est toute la différence.',
          'Que vous soyez chez vous, au travail ou occupé par d\'autres obligations, Washapp permet de faire entretenir votre véhicule sans bouleverser votre journée. C\'est le service qui vient à vous, et non l\'inverse.',
        ]
      },
      {
        heading: 'Gagner du temps sans sacrifier la propreté',
        paragraphs: [
          'Le manque de temps est aujourd\'hui l\'une des principales raisons pour lesquelles les automobilistes retardent le nettoyage de leur voiture. Washapp répond directement à cette difficulté.',
          'En supprimant les déplacements inutiles et en réduisant l\'effort d\'organisation, la plateforme transforme une tâche contraignante en service pratique. Le temps gagné représente du confort, de la sérénité et une meilleure gestion du quotidien.',
        ]
      },
      {
        heading: 'Une marque qui répond à une vraie attente',
        paragraphs: [
          'Les meilleures marques ne sont pas forcément celles qui en font le plus. Ce sont souvent celles qui comprennent un vrai problème du quotidien et y répondent clairement.',
          'La force de Washapp, c\'est de s\'aligner sur une attente réelle du marché. Les conducteurs veulent du pratique, du rapide, du fiable et du moderne. Ils veulent des services qui respectent leur temps.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Choisir Washapp pour le nettoyage de son véhicule, c\'est choisir une solution pensée pour les besoins d\'aujourd\'hui. Gain de temps, simplicité, confort et véhicule plus agréable à utiliser : les avantages sont concrets.',
          'Avec Washapp, le nettoyage automobile devient enfin un service qui s\'adapte au conducteur, et non l\'inverse.',
        ]
      },
    ]
  },
  {
    slug: 'bons-gestes-laver-voiture-carrosserie',
    title: 'Les bons gestes pour laver votre voiture sans abîmer la carrosserie',
    category: 'Conseils',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    excerpt: 'Beaucoup d\'automobilistes commettent sans le savoir des erreurs qui marquent la carrosserie. Voici comment nettoyer votre véhicule efficacement et en toute sécurité.',
    date: '5 Avr 2026',
    readTime: '6 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Laver sa voiture paraît simple. Pourtant, beaucoup d\'automobilistes commettent sans le savoir des erreurs qui peuvent marquer, ternir ou fragiliser la carrosserie avec le temps. Un mauvais chiffon, un lavage en plein soleil, des gestes trop brusques ou des produits inadaptés peuvent laisser des micro-rayures.',
          'C\'est pour cette raison qu\'il est important de connaître les bons gestes. Un lavage efficace ne consiste pas seulement à enlever la saleté visible. Il s\'agit de nettoyer le véhicule avec méthode, douceur et logique, pour préserver l\'état de la peinture.',
        ]
      },
      {
        heading: 'Ne jamais laver sa voiture en plein soleil',
        paragraphs: [
          'Lorsque la carrosserie est chaude, l\'eau et les produits sèchent beaucoup plus rapidement sur la surface. Cela laisse souvent des traces, des auréoles et parfois même des résidus plus difficiles à enlever.',
          'Pour de meilleurs résultats, il est préférable de laver son véhicule à l\'ombre, tôt le matin, en fin de journée ou à un moment où la carrosserie n\'est pas brûlante.',
        ]
      },
      {
        heading: 'Commencer par enlever la poussière avant de frotter',
        paragraphs: [
          'L\'une des pires erreurs pour une carrosserie consiste à frotter directement une surface couverte de poussière, de sable ou de résidus secs. Même si cela paraît anodin, ces petites particules peuvent rayer la peinture dès les premiers gestes.',
          'Avant de passer un chiffon ou une microfibre, il est essentiel de retirer un maximum de saleté superficielle. Ce principe est simple : moins il y a de particules dures sur la surface, moins il y a de risque de micro-rayures.',
        ]
      },
      {
        heading: 'Nettoyer du haut vers le bas',
        paragraphs: [
          'L\'ordre du lavage a lui aussi son importance. Les parties hautes du véhicule sont généralement moins sales que les parties basses. Il est donc logique de commencer par les zones les plus propres pour finir par les plus sales.',
          'Ce simple ordre réduit le risque de contamination entre les zones. Toit, vitres supérieures, capot d\'abord ; bas de caisse et zones proches des roues en dernier.',
        ]
      },
      {
        heading: 'La régularité vaut mieux qu\'un nettoyage brutal occasionnel',
        paragraphs: [
          'Beaucoup de conducteurs attendent que leur voiture soit vraiment très sale avant de la nettoyer. Quand on laisse la saleté s\'accumuler pendant longtemps, le nettoyage devient plus difficile, plus long et parfois plus agressif pour la carrosserie.',
          'Un entretien régulier permet de nettoyer plus facilement et plus doucement. La régularité n\'oblige pas à laver sa voiture sans arrêt — elle permet simplement d\'éviter les situations où il faut insister fortement.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Laver sa voiture sans abîmer la carrosserie repose avant tout sur quelques principes simples : éviter le plein soleil, commencer par retirer les saletés superficielles, utiliser des accessoires propres, ne pas frotter trop fort et respecter un ordre logique.',
          'Ces gestes peuvent sembler simples, mais ils changent beaucoup de choses sur le long terme. Une carrosserie bien entretenue garde mieux son éclat et présente moins de micro-rayures.',
        ]
      },
    ]
  },
  {
    slug: 'combien-de-fois-laver-son-vehicule',
    title: 'Combien de fois faut-il réellement laver son véhicule ?',
    category: 'Conseils',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    excerpt: 'Chaque semaine ou tous les mois ? La bonne fréquence de lavage dépend de votre usage, de l\'environnement et de la météo. Voici comment trouver votre rythme idéal.',
    date: '2 Avr 2026',
    readTime: '7 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'C\'est une question que beaucoup de conducteurs se posent sans toujours trouver de réponse claire. Certains lavent leur voiture presque chaque semaine. D\'autres attendent plusieurs mois. La vérité : il n\'existe pas de fréquence parfaite valable pour tout le monde.',
          'Laver son véhicule régulièrement ne sert pas seulement à améliorer son apparence. Cela permet aussi de préserver la carrosserie, de garder un intérieur plus agréable et de mieux vivre ses trajets au quotidien.',
        ]
      },
      {
        heading: 'Il n\'existe pas de fréquence universelle',
        paragraphs: [
          'Deux véhicules peuvent avoir des besoins très différents selon leur environnement. Une voiture qui dort dehors, roule tous les jours en ville ne se salira pas au même rythme qu\'un véhicule peu utilisé, stationné dans un garage.',
          'Ce qui compte vraiment, c\'est l\'usage réel du véhicule. Plus une voiture est exposée aux éléments extérieurs, plus elle aura besoin d\'un entretien régulier.',
        ]
      },
      {
        heading: 'Pourquoi il ne faut pas attendre que la voiture soit "vraiment sale"',
        paragraphs: [
          'Une saleté installée depuis longtemps est toujours plus difficile à retirer qu\'une saleté récente. Certaines traces accrochent davantage et demandent plus d\'efforts pour retrouver un aspect propre.',
          'Laver plus régulièrement permet justement d\'éviter cet effet de rattrapage. Le nettoyage reste plus simple, plus rapide et plus doux. On entretient le véhicule au lieu de devoir le récupérer.',
        ]
      },
      {
        heading: 'La météo et l\'environnement changent tout',
        paragraphs: [
          'La météo influence directement l\'état d\'un véhicule. Après plusieurs jours de pluie, la carrosserie peut rapidement se couvrir de traces. En période sèche, la poussière s\'installe plus facilement.',
          'En milieu urbain, la pollution atmosphérique et les résidus de circulation peuvent ternir rapidement la carrosserie. À la campagne, d\'autres éléments entrent en jeu : poussière, terre, pollen. Adaptez la fréquence à votre contexte.',
        ]
      },
      {
        heading: 'Washapp facilite justement cette régularité',
        paragraphs: [
          'Beaucoup de conducteurs savent qu\'ils devraient nettoyer leur voiture plus souvent, mais ils repoussent par manque de temps. Washapp simplifie cette équation.',
          'En rendant le lavage plus accessible et plus pratique, la plateforme aide les conducteurs à entretenir leur véhicule plus régulièrement sans bouleverser leur journée.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Il n\'existe pas une fréquence unique valable pour tous les conducteurs. Ce qui compte surtout, c\'est d\'éviter de laisser la saleté s\'installer trop longtemps.',
          'Un entretien régulier permet de préserver l\'apparence du véhicule, de garder un intérieur plus agréable et d\'améliorer le confort quotidien. Mieux vaut une routine réaliste et suivie.',
        ]
      },
    ]
  },
  {
    slug: 'enlever-mauvaises-odeurs-voiture',
    title: 'Comment enlever les mauvaises odeurs dans une voiture',
    category: 'Conseils',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    excerpt: 'Odeur d\'humidité, de nourriture ou de tabac ? Voici comment identifier l\'origine du problème et retrouver un habitacle vraiment agréable — sans masquer l\'odeur.',
    date: '30 Mar 2026',
    readTime: '8 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Une mauvaise odeur dans une voiture peut vite devenir gênante. Parfois, elle apparaît progressivement et l\'on finit presque par s\'y habituer. Odeur d\'humidité, de nourriture, de tabac, de tissu renfermé : quelle que soit son origine, elle change complètement le ressenti à bord.',
          'Pour retrouver une voiture vraiment agréable, il faut comprendre une chose simple : une mauvaise odeur a presque toujours une cause concrète. Tant qu\'on ne traite pas cette cause, l\'odeur revient.',
        ]
      },
      {
        heading: 'Les causes les plus fréquentes',
        paragraphs: [
          'Dans la plupart des cas, les odeurs viennent d\'éléments classiques. La première cause : l\'humidité. Un tapis mouillé, des chaussures humides, une infiltration légère peuvent créer une odeur de renfermé très désagréable.',
          'La nourriture est la deuxième cause fréquente. Une simple miette ou un petit déversement passé inaperçu peut finir par sentir mauvais. Le tabac, les animaux transportés, les déchets oubliés complètent ce tableau.',
        ]
      },
      {
        heading: 'La première étape : vider complètement l\'habitacle',
        paragraphs: [
          'Lorsqu\'une voiture sent mauvais, il faut d\'abord repartir de zéro. Tant que les objets restent à l\'intérieur, on ne peut pas vraiment identifier la source ni nettoyer correctement.',
          'En vidant totalement l\'intérieur, on découvre souvent des choses qu\'on ne remarquait plus : une bouteille oubliée sous un siège, des miettes accumulées, un tapis plus sale qu\'on ne le pensait.',
        ]
      },
      {
        heading: 'Pourquoi masquer l\'odeur ne règle presque rien',
        paragraphs: [
          'Quand une voiture sent mauvais, beaucoup de gens achètent immédiatement un parfum d\'habitacle. Dans la majorité des cas, cela ne fait que repousser le problème.',
          'Un désodorisant peut être utile en finition, une fois que l\'habitacle est réellement nettoyé. Mais il ne doit jamais être la solution principale. Le vrai objectif est de retrouver une odeur neutre, propre, légère.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Les mauvaises odeurs dans une voiture viennent presque jamais de nulle part. Elles sont souvent liées à l\'humidité, aux tapis, aux textiles, à la nourriture ou à un entretien intérieur trop irrégulier.',
          'Pour retrouver un habitacle agréable, il faut agir avec méthode : vider la voiture, traiter les surfaces qui absorbent les odeurs, faire attention à l\'humidité. Une voiture propre ne se voit pas seulement — elle se respire aussi.',
        ]
      },
    ]
  },
  {
    slug: 'voiture-propre-garde-valeur',
    title: 'Pourquoi une voiture propre garde plus de valeur',
    category: 'Valeur',
    categoryColor: '#7c3aed',
    categoryBg: '#f5f3ff',
    excerpt: 'La propreté d\'un véhicule influence directement sa valeur perçue. Découvrez pourquoi l\'entretien visuel est aussi important que l\'entretien mécanique.',
    date: '27 Mar 2026',
    readTime: '7 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Quand on parle de valeur d\'un véhicule, beaucoup de conducteurs pensent d\'abord au kilométrage, à l\'année ou à l\'état mécanique. Mais un autre élément joue un rôle très important : l\'état général du véhicule, et en particulier sa propreté.',
          'Une voiture propre ne donne pas seulement une meilleure impression. Elle inspire davantage confiance, paraît mieux entretenue et se présente sous un meilleur jour.',
        ]
      },
      {
        heading: 'La première impression influence énormément la perception',
        paragraphs: [
          'Dans le monde automobile, la première impression compte énormément. Une voiture propre rassure immédiatement. Elle semble plus sérieuse, plus saine et plus agréable.',
          'À l\'inverse, un véhicule sale suscite souvent des doutes. Même si le moteur est en bon état, une carrosserie terne peut donner l\'impression que la voiture n\'a pas été suivie avec rigueur.',
        ]
      },
      {
        heading: 'L\'intérieur compte parfois encore plus que l\'extérieur',
        paragraphs: [
          'Si l\'extérieur attire l\'œil en premier, l\'intérieur confirme ou détruit rapidement la bonne impression. Un habitacle propre donne une sensation immédiate de soin.',
          'Une odeur désagréable, des déchets oubliés, des surfaces grasses ou des tissus marqués peuvent faire chuter brutalement la perception de qualité, même si la voiture reste techniquement fiable.',
        ]
      },
      {
        heading: 'Une voiture propre inspire davantage confiance lors d\'une revente',
        paragraphs: [
          'Le moment où la propreté devient la plus stratégique, c\'est la revente. Le futur acheteur doit se fier à ce qu\'il voit, à ce qu\'il ressent et à l\'impression générale.',
          'Une voiture propre rassure. Elle montre que le propriétaire a pris le temps de la présenter correctement. À l\'inverse, une voiture sale peut conduire à des offres plus basses et à plus de méfiance.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Une voiture propre garde plus de valeur parce qu\'elle inspire davantage confiance, paraît mieux entretenue et se présente sous un meilleur jour à chaque étape de son usage.',
          'Prendre soin de la propreté de sa voiture, c\'est aussi prendre soin de son investissement. Et plus cet entretien est régulier, plus les bénéfices se ressentent dans le temps.',
        ]
      },
    ]
  },
  {
    slug: 'lavage-rapide-ou-nettoyage-complet',
    title: 'Lavage rapide ou nettoyage complet : quelle différence ?',
    category: 'Conseils',
    categoryColor: '#d97706',
    categoryBg: '#fffbeb',
    excerpt: 'Ces deux approches ne répondent pas au même besoin. Découvrez quand choisir un lavage rapide, quand opter pour un nettoyage complet et comment les combiner intelligemment.',
    date: '24 Mar 2026',
    readTime: '8 min',
    sections: [
      {
        heading: null,
        paragraphs: [
          'Quand une voiture commence à se salir, beaucoup de conducteurs se posent la même question : faut-il faire un simple lavage rapide ou prévoir un nettoyage plus complet ? En réalité, ces deux approches ne répondent pas exactement au même besoin.',
          'Tout dépend de l\'état du véhicule, du temps écoulé depuis le dernier entretien et du niveau de propreté recherché.',
        ]
      },
      {
        heading: 'Le lavage rapide : une remise en propre efficace',
        paragraphs: [
          'Le lavage rapide répond à un besoin simple : redonner rapidement au véhicule une apparence plus nette sans engager une intervention lourde. Poussière légère, traces superficielles, vitres un peu marquées : dans ce type de situation, il peut suffire.',
          'C\'est particulièrement pertinent quand le véhicule est déjà entretenu assez régulièrement. Le lavage rapide sert de maintien. Il évite que la saleté s\'installe trop longtemps.',
        ]
      },
      {
        heading: 'Le nettoyage complet : une remise à niveau profonde',
        paragraphs: [
          'Le nettoyage complet répond à une autre logique. Il ne s\'agit plus seulement de redonner une impression de propreté rapide. Il s\'agit de traiter le véhicule de manière plus approfondie pour retrouver une vraie sensation de fraîcheur.',
          'Ce type d\'intervention devient utile lorsque le véhicule a accumulé les salissures, que l\'intérieur commence à fatiguer visuellement, ou que certaines zones ont été négligées.',
        ]
      },
      {
        heading: 'L\'idéal : alterner intelligemment les deux',
        paragraphs: [
          'La meilleure stratégie n\'est pas d\'opposer lavage rapide et nettoyage complet. C\'est de les utiliser de manière complémentaire.',
          'Le lavage rapide permet de maintenir une bonne présentation régulièrement. Le nettoyage complet intervient à des moments clés. Cette combinaison est souvent la plus efficace.',
        ]
      },
      {
        heading: 'Conclusion',
        paragraphs: [
          'Le lavage rapide et le nettoyage complet ne s\'opposent pas. Ils répondent simplement à deux niveaux de besoin différents.',
          'L\'idéal est d\'alterner intelligemment les deux en fonction de l\'état du véhicule, de son usage et du résultat recherché. Une voiture bien entretenue a toujours besoin du bon niveau d\'attention au bon moment.',
        ]
      },
    ]
  },
];

export const BLOG_CATEGORIES = [
  { name: 'Tous', value: 'all' },
  { name: 'Conseils', value: 'Conseils' },
  { name: 'Pratique', value: 'Pratique' },
  { name: 'Washapp', value: 'Washapp' },
  { name: 'Valeur', value: 'Valeur' },
];
