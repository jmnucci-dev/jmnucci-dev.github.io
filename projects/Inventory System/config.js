window.PROJECT_CONFIGS = window.PROJECT_CONFIGS || {};
window.PROJECT_CONFIGS['Inventory System'] = {
  category: 'ROBLOX / UI', status: 'Complete / archived', challenge: 'Radial UI behaviour', featured: true,
  description: 'A radial inventory interface with four slots, smooth transitions and scripted interaction logic.',
  stack: ['Luau','OOP','UI','Animations'],
  features: ['4-slot radial layout','Smooth slot transitions','Selection logic','Input handling','Reusable UI controller'],
  architecture: 'The inventory state is kept separate from presentation so the same data can drive different inventory UIs.',
  codeTitle: 'InventoryController.luau', language: 'Luau',
  code: `function InventoryController:Select(index: number)\n    if not self.Slots[index] then return end\n    self.Selected = index\n    self:AnimateSelection(index)\nend`,
  note: 'Representative excerpt, selected to show the separation between state and UI behaviour.',
  videos: ['https://youtu.be/XkyDFCJox8M'],
  images: [], github: '#'
};
