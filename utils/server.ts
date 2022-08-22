import { Highlight } from './types';

const LOCAL_SERVER_URL = 'http://localhost:4000';
const SERVER_URL = 'https://api.archiveofherown.org';

export async function serverGetHighlights(workId: number) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL || LOCAL_SERVER_URL}/highlight/getAllForWork`;
  const body = { workId };

  try {
    console.log('Calling ',url,' with data ', body);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await res.json();

    console.log('Server return ',data)

    if(data.success)
      return data.highlights as Highlight[];
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }

  return [] as Highlight[];
}

export async function serverSaveHighlight(highlight: Highlight, username: string, workId: number) {
  return await serverEditHighlight(highlight, username, workId, 'upsert');
}

export async function serverDeleteHighlight(highlight: Highlight, username: string, workId: number) {
  return await serverEditHighlight(highlight, username, workId, 'delete');
}

async function serverEditHighlight(highlight: Highlight, username: string, workId: number, opType: 'delete' | 'upsert') {
  console.log('Saving highlight ',highlight, ' for user ',username,' and work ',workId);

  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL || LOCAL_SERVER_URL}/highlight/upsert`;
  const body = {
    creator: username,
    workId: workId,
    highlightId: highlight.id,
    chapterId: highlight.chapterId,
    startTag: highlight.startTag,
    endTag: highlight.endTag,
    note: highlight.note,
    opType
  };

  try {
    console.log('Calling ',url,' with data ', body);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await res.json();

    console.log('Server return ',data)
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }
}