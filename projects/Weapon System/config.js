window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Weapon System'] = {
  category: 'ROBLOX / SYSTEM', status: 'Almost complete', challenge: 'Lag compensation', featured: true,
  description: 'A modular Roblox weapon framework built around clean separation, server authority and responsive hitscan gameplay.',
  stack: ['Luau','Typed Luau','OOP','Blink','Raycast','Chrono','GoodSignal'],
  features: ['Modular weapon configuration','Server-side hit validation','Lag compensation','Hitscan raycasting','Client / server separation','Reusable weapon lifecycle'],
  architecture: 'Weapons are driven by configuration and modules rather than duplicated scripts. Client code handles responsiveness and presentation while the server remains responsible for validating important gameplay decisions.',
  codeTitle: 'WeaponController.luau', language: 'Luau',
  code: `function WeaponController:Fire(origin: Vector3, direction: Vector3)\n    if not self:IsReady() then\n        return\n    end\n\n    self.Network:FireServer({\n        origin = origin,\n        direction = direction,\n        timestamp = workspace:GetServerTimeNow(),\n    })\nend`,
  note: 'Representative excerpt, replace with a real public-safe snippet when publishing the final version.',
  videos: ['https://youtu.be/u_IP6GcqkoE', 'https://youtu.be/MEbXnts_LtQ'],
  images: [],
  github: 'https://github.com/jmnucci-dev/weapon-system-sample'
};
