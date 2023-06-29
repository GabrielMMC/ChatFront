const colors = [
  { backgroundColor: '#FFAAAA', color: '#AA3939' },
  { backgroundColor: '#88CC88', color: '#2D882D' },
  { backgroundColor: '#FFFEAA', color: '#AAA939' },
  { backgroundColor: '#9775AA', color: '#582A72' },
  { backgroundColor: '#9FD0F3', color: '#4AA0DD' },
  // { backgroundColor: '#F79CDC', color: '#DF1FA5' },
  // { backgroundColor: '#FFC5A2', color: '#FF7824' },
  // { backgroundColor: '#E4FDA1', color: '#A4E000' },
]

export const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
