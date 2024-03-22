function AddLineBreaks(items) {
    // Transform the items to replace line breaks
    return items.map(hit => {
      // console.log('original lyric: ', hit.lyric);
      const transformedLyric = hit.lyric.replace(/\n/g, '<br>');
      // console.log('transformed lyric: ', transformedLyric);

      return {
        ...hit,
        lyric: transformedLyric
      }
    });
  }

  export default AddLineBreaks