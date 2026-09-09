window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Pokedex'] = {
  category: 'WEB / SCHOOL PROJECT', status: 'In progress', challenge: 'Caching + data flow', featured: true,
  description: 'A Flask-based Pokédex that consumes REST data, caches Pokémon information and serves a custom Jinja2 frontend.',
  stack: ['Python','Flask','Jinja2','HTML','CSS','REST','JSON','Caching'],
  features: ['Region browser','Pokémon listing','Pokémon detail pages','REST API consumption','Local JSON cache','Custom frontend'],
  architecture: 'The backend sits between the pages and the external API. Cached JSON keeps repeated requests fast and avoids asking the API for the same Pokémon data every time.',
  codeTitle: 'pokemon_service.py', language: 'Python',
  code: `def get_pokemon_data(name: str) -> dict:\n    query = name.strip().lower()\n    cache_file = CACHE_DIR / f"{query}.json"\n\n    if cache_file.exists():\n        return json.loads(cache_file.read_text())\n\n    response = requests.get(\n        f"{API_URL}/pokemon/{query}", timeout=10\n    )\n    response.raise_for_status()\n\n    data = response.json()\n    cache_file.write_text(json.dumps(data))\n    return data`,
  note: 'A shortened example of the caching idea, not the complete project source.',
  videos: [],
  images: ['hero.webp','screenshot-01.webp','screenshot-02.webp'], github: '#'
};
