window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Pokedex'] = {
  category: 'WEB / SCHOOL PROJECT', status: 'Completed', challenge: 'Caching + data flow + group collaboration', featured: true,
  description: 'Interactive Pokédex built with a group of 4 for the ETEC Technology Fair, Web Programming. Front co-created by the group; back-end by me using Flask, Jinja2 and local JSON caching via PokeAPI.',
  stack: ['Python','Flask','Jinja2','HTML5','CSS3','Bulma','PokeAPI','JSON','Caching'],
  features: ['Region browser','Pokémon listing','Pokémon detail pages','REST API consumption','Local JSON cache','Custom Jinja2 frontend','Collaborative front-end design'],
  architecture: 'Flask backend serves Jinja2 templates and consumes PokeAPI. Cached JSON files keep repeated requests fast and reduce external calls.',
  codeTitle: 'pokemon_service.py', language: 'Python',
  code: `def get_pokemon_data(name: str) -> dict:\n    query = name.strip().lower()\n    cache_file = CACHE_DIR / f"{query}.json"\n\n    if cache_file.exists():\n        return json.loads(cache_file.read_text())\n\n    response = requests.get(\n        f"{API_URL}/pokemon/{query}", timeout=10\n    )\n    response.raise_for_status()\n\n    data = response.json()\n    cache_file.write_text(json.dumps(data))\n    return data`,
  videos: ['https://youtu.be/PgLEJHqV22U'],
  images: ['screenshot-01.png','screenshot-02.png','screenshot-03.png'], github: 'https://github.com/jmnucci-dev/pokedex-feira-etec'
};
