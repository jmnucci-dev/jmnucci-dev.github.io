window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Volleyball System'] = {
  category: 'ROBLOX / PHYSICS', status: 'Incomplete / archived', challenge: 'Ball physics',
  description: 'A volleyball gameplay system built around action-based ball movement and physics-heavy interactions.',
  stack: ['Luau','OOP','Physics','Animations','UI'],
  features: ['Spike','Block','Manchete','Ball interactions','Action-based movement'],
  architecture: 'Player actions feed a small set of reusable ball behaviours while the game state coordinates the match flow.',
  codeTitle: 'BallController.luau', language: 'Luau',
  code: `function BallController:SetVelocity(velocity: Vector3)\n    self.Part.AssemblyLinearVelocity = velocity\n    self.LastVelocity = velocity\nend`,
  note: 'Representative excerpt from the kind of physics logic used by the system.',
  videos: [],
  images: ['hero.webp','screenshot-01.webp'], github: '#'
};
