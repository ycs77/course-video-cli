import { v1p1beta1 as speech } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import fs from 'fs';

// 哈囉大家好我是  陸客  歡迎來到我們這 一趟 用 css3           來做一個後台界面的ui
// 哈囉大家好我是 Lucas  歡迎來到我們這 一堂 用 Tailwind CSS 3 來做一個後台界面的ui

// 'Lucas', '一堂', 'Tailwind CSS'

async function main() {
  const projectId = 'lucas-speech';
  const location = 'global';
  const customClassId = 'test-custom-class-1';
  const phraseSetId = 'test-phrase-set-1'

  const client = new speech.SpeechClient();
  const adaptationClient = new speech.AdaptationClient();

  const filename = 'audio.mp3';
  const encoding = 'MP3' as keyof typeof google.cloud.speech.v1.RecognitionConfig.AudioEncoding;
  const languageCode = 'zh-TW';

  // Create`PhraseSet` and `CustomClasses` to create custom lists of similar
  // items that are likely to occur in your input data.

  // The parent resource where the custom class and phrase set will be created.
  const parent = `projects/${projectId}/locations/${location}`;

  // Create the custom class
  // await adaptationClient.deleteCustomClass({ name: customClassId })
  const customClassResponse = await adaptationClient.createCustomClass({
    parent: parent,
    customClassId: customClassId,
    customClass: {
      items: [
        {value: 'Lucas'},
        {value: '一堂'},
        {value: 'Tailwind CSS'},
      ],
    },
  });

  // Create the phrase set
  // await adaptationClient.deletePhraseSet({ name: phraseSetId })
  const phraseSetResponse = await adaptationClient.createPhraseSet({
    parent: parent,
    phraseSetId: phraseSetId,
    phraseSet: {
      boost: 10,
      phrases: [{value: `\${${customClassId}}`}],
    },
  });

  // The next section shows how to use the newly created custom
  // class and phrase set to send a transcription request with speech adaptation

  const speechAdaptation = {
    phraseSets: [phraseSetResponse[0]],
    phraseSetReferences: [phraseSetResponse[0].name],
    customClasses: [customClassResponse[0]],
  } as google.cloud.speech.v1p1beta1.ISpeechAdaptation;

  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const config = {
    encoding,
    sampleRateHertz: 16000,
    languageCode,
    adaptation: speechAdaptation,
  } as google.cloud.speech.v1p1beta1.IRecognitionConfig;

  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    ?.map(result => result.alternatives?.[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
}

main();
