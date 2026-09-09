window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Orb Rush'] = {
  category: 'ROBLOX / COMMISSION', status: 'Complete / archived', challenge: 'Ball physics + PvP', featured: true,
  description: 'A commissioned Roblox game where players control a ball, move through parkour sections and fight using abilities purchased from a shop.',
  stack: ['Luau','OOP','Physics','PvP','UI','Networking'],
  features: ['Ball-based movement','Parkour traversal','PvP combat','Ability shop','Special powers','Commissioned development'],
  architecture: 'The project mixed physics-heavy character control with combat and progression systems. The goal was to keep those systems independent enough that movement and combat could evolve without breaking each other.',
  codeTitle: 'OrbMovement.luau', language: 'Luau',
  code: `local function getMoveVelocity(input: Vector3, speed: number)\n    if input.Magnitude == 0 then\n        return Vector3.zero\n    end\n\n    local direction = input.Unit\n    return Vector3.new(\n        direction.X * speed,\n        0,\n        direction.Z * speed\n    )\nend`,
  note: 'Representative excerpt. A safe-to-publish sample is better here than exposing private commissioned code.',
  videos: [],
  images: [], github: '#'
};
