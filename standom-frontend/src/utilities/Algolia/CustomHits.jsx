import React from 'react'
import { connectHits } from 'instantsearch.js/es/connectors';

// Custom Hits component with transformItems function
const CustomHits = connectHits(({ hits }) => {
    // Transform the items to replace line breaks
    const transformedHits = hits.map(hit => ({
      ...hit,
      lyric: hit.lyric.replace(/\\n/g, '<br>') // Replace '\n' with HTML <br> tags
    }));
  
    return (
      <div>
        {transformedHits.map(hit => (
          <div key={hit.objectID}>
            <h2>{hit.song_title}</h2>
            <p dangerouslySetInnerHTML={{ __html: hit.lyric }}></p> {/* Render HTML */}
          </div>
        ))}
      </div>
    );
  });

  export default CustomHits