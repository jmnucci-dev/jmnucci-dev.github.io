window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Combat System'] = {
  category: 'ROBLOX / SYSTEM', status: 'Incomplete / archived', challenge: 'Smooth combat movement', featured: true,
  description: 'A modular battleground-style combat system built around client detection, server validation and smooth character motion.',
  stack: ['Luau','Typed Luau','OOP','Blink','GoodSignal'],
  features: ['M1 flow','Blocking','Client-side hit detection','Server validation','Hitbox handling','Combat animations'],
  architecture: 'The system separates input, detection, validation and presentation so combat logic does not collapse into one client script.',
  codeTitle: 'CombatController.luau', language: 'Luau',
  code: `function CombatController:CanAttack()\n    return not self.State.Stunned\n        and not self.State.Blocking\n        and self.Cooldown:Ready("M1")\nend`,
  note: 'Representative excerpt. The public version can be replaced with a selected source-safe snippet.',
  videos: ['https://youtu.be/S8fmIv7QeE0'],
  images: [], github: '#'
};
