## Browser-Based Speech Synthesis with the Web Speech API

### Introduction

- Most of us have at least watched an old sci-fi movie(or recent) that has computer/robotic voices. With time, these voices and illustrations have improved, by sounding human-like.
- Modern browsers can now incorporate voice data into web applications.
- This was made possible using the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  which works by providing an interface to do [Speech Recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition),
  that converts audio to text,
  and [Speech Synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) whose functionality is to convert
  Text-To-Speech(TTS).


### Use Cases of Speech Synthesis

1. Accessibility:
    - Speech synthesis allows users with disabilities, such as visually impared persons, to navigate websites, documents, and apps by reading text.
    - For instance, the late Dr. Stephen Hawking used a specialized system that combined speech synthesis
      technology with a custom UI to enable him to speak despite his motor neuron disease, which left him unable to use his natural voice.
2. Voice Assistants and Smart Devices:
    - Voice assistants, e.g. Google Assistant, Amazon Alexa, and Apple's SIRI, use TTS to communicate with users and perform tasks.
3. Learning & Content Consumption:
    - E-learning platforms, such as Khan Academy, enhance accessibility by providing audio versions of course materials.
    - Multiple AI Gen tools e.g. Google Gemini, and ChatGPT already have TTS for the responses.
    - News Companies like BBC offer audio-based versions of their news articles.
4. Customer support:
    - Chatbots with TTS provide spoken responses in chat-based or voice-call support.
    - Some of them include CleverBot, and Zendesk.
5. Automobile industries:
    - Navigation systems, e.g. Google Maps support voice instructions to ensure drivers don't take their eyes off the road.
    - Companies like Ford and Tesla offer hands-free calling and text-message reading as well as voice-controlled navigation.


### Technical Overview

The Speech Synthesis API consists of the following interfaces-

1. `window.speechSynthesis`: The controller that manages the lifecycle of speech operations. The methods and properties include:
    - Methods
        - `speak(utterance)`: Adds a `SpeechSynthesisUtterance` instance to the speech queue and starts speaking it.
        - `pause()`: Pauses any ongoing speech.
        - `resume()`: Resumes paused speech
        - `cancel()`: Cancels all ongoing and queued utterances.

    - Properties
        - `pending`: Returns `true` if there are pending utterances in the queue.
        - `speaking`: Returns `true` if an utterance is currently being spoken.
        - `paused`: Returns `true` if speech is paused.
      ```js
      /*
      * Copy-Paste this on the browser console
      */
      const synth = window.speechSynthesis;
     
      const utterance = new SpeechSynthesisUtterance('Hello, this is my computer voice.');
      const secondUtterance = new SpeechSynthesisUtterance('Another instance of speech.');
     
      synth.speak(firstUtterance)
      console.log('Currently speaking: ', synth.speaking);
     
      synth.speak(secondUtterance);
      console.log('Pending utterances: ', synth.pending);
     
      // Pause
      setTimeout(() => {
        synth.pause(); // in some cases, pause does not update the internal state
        console.log('Speech Paused: ', synth.paused);
      }, 1000);
     
      // Resume
      setTimeout(() => {
        synth.resume();
        console.log('Currently speaking: ', synth.speaking);
      }, 2000);
     
      // Cancel
      setTimeout(() => {
        synth.cancel();
        console.log("Pending utterances?", synth.pending); // Output: false
        console.log("Currently speaking?", synth.speaking); // Output: false
        console.log("Currently Paused?", synth.paused); // Output: false
      }, 3000);
      ```
2. `SpeechSynthesisUtterance`: Represents the speech request and contains information about the nature of the speech output.
   The API has the following properties and events:
    - Properties
        - `text`: The text to be spoken.
        - `lang`: The language of the text (e.g., 'en-US', 'fr-FR').
        - `rate`: The speed of speech (default is 1.0).
        - `pitch`: The pitch of the voice (range: 0.0 to 2.0).
        - `volume`: The volume level (range: 0.0 to 1.0).
        - `voice`: The voice used for the spoken text.
    - Events
        - `onstart`: Fired when speech begins.
        - `onend`: Fired when speech ends.
        - `onerror`: Fired when an error occurs.
        - `onpause`: Fired when speech is paused.
        - `onresume`: Fired when speech resumes.
        - `onboundary`: Fired when the speech reaches a word or sentence boundary.

    ```js
    const utterance = new SpeechSynthesisUtterance();
    
    // Set the text to be spoken
    utterance.text = "Hello, world!";
    
    // Set the language
    utterance.lang = 'en-US';
    
    // Set the speech rate (faster than normal)
    utterance.rate = 1.2;
    
    // Set the pitch (higher than normal)
    utterance.pitch = 1.5;
    
    // Set the volume 
    utterance.volume = 0.8;
    
    // Event listeners
    utterance.onstart = () => {
      console.log('Speech has started');
    };
    
    utterance.onend = () => {
      console.log('Speech has finished');
    };
    
    // onpause and onresume might not fire if the browser state hasn't been updated
    utterance.onpause = () => {
      console.log('Speech has paused');
    };
    
    utterance.onresume = () => {
      console.log('Speech has resumed');
    };
    
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };
    
    utterance.onboundary = (event) => {
      console.log(`Word boundary at index: ${event.charIndex}, elapsed time: ${event.elapsedTime}s`);
    };
    
    
    const synth = window.speechSynthesis;
    synth.speak(utterance);
    
    setTimeout(() => {
      synth.pause();
    }, 2000);
    
    setTimeout(() => {
      synth.resume();
    }, 4000);
    
    setTimeout(() => {
      synth.cancel();
    }, 6000);
    ```
3. `SpeechSynthesisVoice`: Represents individual voices available for use in speech synthesis. The list of available voices can vary depending on the user's operating system and device, browser, and installed voice packs. The API exposes the following methods and properties:
    - `name`: The voice's name (e.g., 'Google UK English Female').
    - `lang`: The language code of the voice (e.g., 'en-US' or 'es-ES').
    - `default`: A boolean indicating if the voice is the browser's default.
    - `localService`: A boolean indicating if the voice is local or fetched from an online service.
    - `voiceURI`: A unique ID for the voice.
    ```js
    const voices = window.speechSynthesis.getVoices();
    
    voices.forEach(voice => {
      console.log(`Name: ${voice.name}`);
      console.log(`Language: ${voice.lang}`);
      console.log(`Default: ${voice.default}`);
      console.log(`Local Service: ${voice.localService}`);
      console.log(`Voice URI: ${voice.voiceURI}`);
      console.log('------------------');
    });
    // Find voice
    const frenchVoice = voices.find(voice => voice.lang === 'fr-FR');
    const utterance = new SpeechSynthesisUtterance("Bonjour, c'est ma voix d'ordinateur.");
    if (frenchVoice) utterance.voice = frenchVoice;
    speechSynthesis.speak(utterance);
    ```


### Browser Compatibility

It currently [supports](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis#browser_compatibility) common browsers like Chrome, Safari, Firefox, and Edge.

To ensure that it loads correctly, check if the user's browser supports it
```js
if ('speechSynthesis' in window) {
      // Speech Synthesis supported :)
} else {
      // Speech Synthesis not supported :(
}
```

Key limitations to consider:
- Voice availability varies by browser and operating system. Each browser leverages system-level resources to provide speech synthesis capabilities, which can lead to discrepancies in the number, type, and quality of voices available.
- Speech quality differs between browsers. Different browsers may offer varying levels of quality due to differences in the TTS engines they use.
- Mobile device support may be limited. This is because speech synthesis on mobile devices often comes with limited functionality and different behavior compared to desktops.
- Network connectivity can affect performance. While the Speech Synthesis API itself doesn’t rely on the internet for local voices, certain high-quality voices or advanced features may require network access


### Security Considerations

1. User Permissions:
    - Some browsers require user interaction before allowing speech synthesis.
    - Implement a user activation check before speaking.

2. Content Security Policy (CSP):
    - Ensure your CSP allows access to speech synthesis features.


### Performance Optimization

1. Voice Loading:
    - Cache voices after initial load, or having a static file. The voices don't change as often.
    - Implement lazy loading for voices when possible.

2. Memory Management:
    - Clear utterances after use.
    - Implement proper cleanup in component lifecycle methods.

### What to do next

There's much to cover when doing TTS, but some of these enhancements are worth considering when working on prod-ready app. 
1. Voice Preference Persistence: Save and apply user voice preferences using localStorage.
2. Progressive Enhancement: Provide fallbacks and recommendations for unsupported browsers.
3. Accessibility Considerations: Improve usability for all users with ARIA roles, keyboard navigation, and visual feedback.
4. Internationalization Support: Handle multiple languages using dynamic voice selection and localization files.
5. Handle edge-cases: 
   - As you've seen above, there are instances where the browser doesn't update the internal state. Therefore, manually adding these event listeners might help to mitigate such issues.
   - One other issue I found was updating utterances while speech in progress results to an error.
   - The `onboundary` event is a bit buggy, where the currentWord index might be ahead of the speech.
6. Use [SSML](https://www.w3.org/TR/speech-synthesis11/#S1):
   - Speech Synthesis Markup Language specification (SSML) is an XML-Based markup language that assists in generating natural-sounding speech.
   - SSML empowers you to go beyond simply converting text to speech. It has enough markup for voice control including prosody, speech control, and emphasis.
   - For example: Using word censors, the following example will have a beep sound.
   ```xml
   <speak>
     <say-as interpret-as="expletive">censor this</say-as>
   </speak>
   ```


### Conclusion

Browser-based speech synthesis represents an opportunity to enhance your digital presence and experience while maintaining
cost-effectiveness and technical simplicity. 

To read more: 
- [W3C spec speech API](https://webaudio.github.io/web-speech-api/).
- [SSML](https://cloud.google.com/text-to-speech/docs/ssml).

Check out the TTS version of this blog  [here](https://github.com/ridge-kimani/speech-synthesis-demo).