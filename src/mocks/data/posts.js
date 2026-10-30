// Makes a timestamp for "X minutes ago", so posts always look recent
function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

export const posts = [
  { id: 101, authorId: 1, content: 'Anyone want to form a study group for the CSCI midterm? Thinking Killam Library tomorrow at 6 📚', createdAt: minutesAgo(12), likeCount: 8, commentCount: 3 },
  { id: 102, authorId: 4, content: 'Sunset at Point Pleasant Park today was unreal 🌅', createdAt: minutesAgo(45), likeCount: 21, commentCount: 4 },
  { id: 103, authorId: 2, content: 'Our team made it to the finals of the case competition! Wish us luck this Friday 🙌', createdAt: minutesAgo(130), likeCount: 34, commentCount: 9 },
  { id: 104, authorId: 7, content: 'Made a huge pot of soup for the week. Clinical placement starts Monday, meal prep is survival mode.', createdAt: minutesAgo(300), likeCount: 12, commentCount: 2 },
  { id: 105, authorId: 6, content: 'Just deployed my first website ever. It is ugly but it is MINE.', createdAt: minutesAgo(600), likeCount: 27, commentCount: 6 },
  { id: 106, authorId: 8, content: 'Pickup soccer at Wickwire Field Saturday morning. Need 3 more players, message me!', createdAt: minutesAgo(1500), likeCount: 9, commentCount: 5 },
  { id: 107, authorId: 3, content: 'Robotics club demo day is next week. Come see what we have been building all term 🤖', createdAt: minutesAgo(2900), likeCount: 18, commentCount: 1 },
  { id: 108, authorId: 5, content: 'Volunteering at the food bank this weekend. If anyone wants to join, there are still spots open.', createdAt: minutesAgo(8000), likeCount: 15, commentCount: 3 },
]