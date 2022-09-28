import { DisplayPreferences, initialDisplayPreferences } from '@/components/Redux-Store/UserSlice';
import { Highlight, ScrollPosition, UserWorkInfo } from './types';

// const SERVER_URL = 'http://localhost:4001';
const SERVER_URL = 'https://api.archiveofherown.org';

export async function getUserWorkInfo(username: string, workId: number) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/userwork/getInfo`;

  const body = {
    username,
    workId
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await res.json();

    if(data.success)
      return data.userWork as UserWorkInfo;
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }

  return null;
}

export async function savePausedPosition(username: string, workId: number, pausePosition: ScrollPosition) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/userwork/setPausePosition`;

  const body = {
    username,
    workId,
    pausePosition
  }

  console.log('Saving pause position to server - ',body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }
}

export async function getDisplayPreferences(username: string, deviceId: string) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/preferences/display/get`;

  const body = {
    username,
    deviceId,
    displayPreferences: initialDisplayPreferences
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await res.json();

    if(data.success)
      return data.preferences as DisplayPreferences;
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }

  return initialDisplayPreferences;
}

export async function saveDisplayPreferences(username: string, deviceId: string, displayPreferences: DisplayPreferences) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/preferences/display/upsert`;

  const body = {
    username,
    deviceId,
    displayPreferences
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    console.log('Saving returned - ',await res.json());
  } catch(err) {
    console.error('Error Calling ',url,' with data ', body, ' - ', err);
  }
}

export async function serverGetHighlights(workId: number) {
  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/highlight/getAllForWork`;
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

  const url = `${process.env.REACT_APP_SERVER_URL || SERVER_URL}/highlight/upsert`;
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