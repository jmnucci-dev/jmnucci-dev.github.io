window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Movement System'] = {
  category: 'ROBLOX / SYSTEM', status: 'Complete / archived', challenge: 'Smooth parkour movement', featured: true,
  description: 'A modular parkour movement system focused on responsive traversal and movement that feels consistent instead of scripted.',
  stack: ['Luau','Typed Luau','OOP','CFrame','Physics','GoodSignal','Janitor'],
  features: ['Obstacle vault','Wall running','Wall jump','Ledge grab','Directional dash','Double jump','Running'],
  architecture: 'Movement abilities are separated into modules and coordinated by a central controller, making individual abilities easier to tune without turning the character controller into one giant script.',
  codeTitle: 'MovementController.luau', language: 'Luau',
  code: `function MovementController:Dash(direction: Vector3)\n    direction = direction.Magnitude > 0\n        and direction.Unit\n        or self.Root.CFrame.LookVector\n\n    self.Root.AssemblyLinearVelocity = Vector3.new(\n        direction.X * self.DashSpeed,\n        self.Root.AssemblyLinearVelocity.Y,\n        direction.Z * self.DashSpeed\n    )\nend`,
  note: 'Representative excerpt, replace with your actual implementation when publishing source.',
  videos: ['https://youtu.be/GyCWezUiHWk'],
  images: [], github: '#'
};
