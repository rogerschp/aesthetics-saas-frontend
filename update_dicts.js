const fs = require('fs');

const addTranslations = (file, additions) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const newData = { ...data, ...additions };
  fs.writeFileSync(file, JSON.stringify(newData, null, 2));
};

addTranslations('src/messages/pt.json', {
  "Home": {
    "highlights": "Destaques na sua Região",
    "footer": "© {year} BarberShop SaaS. Todos os direitos reservados."
  }
});

addTranslations('src/messages/en.json', {
  "Home": {
    "highlights": "Highlights in your Region",
    "footer": "© {year} BarberShop SaaS. All rights reserved."
  }
});

addTranslations('src/messages/es.json', {
  "Home": {
    "highlights": "Destacados en tu Región",
    "footer": "© {year} BarberShop SaaS. Todos los derechos reservados."
  }
});
