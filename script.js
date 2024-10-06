document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const sidebar = document.getElementById('sidebar');
    const openSidebarButton = document.getElementById('openSidebar');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const chatBuddySelect = document.getElementById('chatBuddy');
    const languageSelect = document.getElementById('language');
    const saveSettingsButton = document.getElementById('saveSettings');
    const openSettingsButton = document.getElementById('openSettings');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModalButton = settingsModal.querySelector('.close');
    const userInput = document.getElementById('userInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatHistory = document.getElementById('chatHistory');
    const voiceRecordButton = document.getElementById('voiceRecord');
    const startNewChatButton = document.getElementById('startNewChat');
    const aboutModal = document.getElementById('aboutModal');
    const openAboutButton = document.getElementById('openAbout');
    const closeAboutButton = aboutModal.querySelector('.close');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const scrollToBottomButton = document.getElementById('scrollToBottom');

    let chatBuddy = 'factFinder';

    // Open sidebar
    openSidebarButton.addEventListener('click', () => {
        sidebar.style.left = '0';
    });

    // Close sidebar
    closeSidebarButton.addEventListener('click', () => {
        sidebar.style.left = '-350px';
    });

    // Open settings modal
    openSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    // Close settings modal
    closeSettingsModalButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // Save settings
    saveSettingsButton.addEventListener('click', () => {
        chatBuddy = chatBuddySelect.value;
        const language = languageSelect.value;
        console.log(`Chat buddy changed to: ${chatBuddy}`);
        console.log(`Language changed to: ${language}`);
        settingsModal.style.display = 'none';
        introduceChatBuddy();
    });

    // Send message
    sendMessageButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('User', message);
            handleChat(message);
            userInput.value = '';
        }
    });

    // Voice recording
    voiceRecordButton.addEventListener('click', () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();

                    const audioChunks = [];
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);
                        audio.play();
                        console.log('Voice recording played.');
                    };

                    setTimeout(() => {
                        mediaRecorder.stop();
                    }, 5000); // Record for 5 seconds
                })
                .catch(error => {
                    console.error('Error accessing audio device:', error);
                });
        } else {
            console.error('Audio recording not supported.');
        }
    });

    // Start new chat
    startNewChatButton.addEventListener('click', () => {
        chatHistory.innerHTML = '';
        console.log('New chat started.');
    });

    // Open About modal
    openAboutButton.addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });

    // Close About modal
    closeAboutButton.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    // Click outside of modal to close it
    window.addEventListener('click', (event) => {
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Scroll to bottom
    scrollToBottomButton.addEventListener('click', () => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    // Append message to chat history
    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `${sender}: ${message}`;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
    }

    // Introduce chat buddy
    function introduceChatBuddy() {
        let introduction = 'Hi Len Here, ';
        switch (chatBuddy) {
            case 'factFinder':
                introduction += 'I can help you find facts and information.';
                break;
            case 'mathMastermind':
                introduction += 'I can solve math problems, both simple and complex.';
                break;
            case 'imageMaker':
                introduction += 'I can generate images based on your prompts.';
                break;
            case 'studyBuddy':
                introduction += 'I can provide study material based on a topic.';
                break;
            default:
                introduction += 'What can I do for you today?';
                break;
        }
        appendMessage('AI', introduction);
    }

    // Handle chat based on chat buddy
    function handleChat(message) {
        loadingIndicator.style.display = 'block'; // Show loading indicator
        switch (chatBuddy) {
            case 'factFinder':
                fetchFactFinder(message);
                break;
            case 'mathMastermind':
                solveMath(message);
                break;
            case 'imageMaker':
                handleImageMaker(message);
                break;
            case 'studyBuddy':
                handleStudyBuddy(message);
                break;
            default:
                appendMessage('AI', "I'm not sure how to help with that.");
                loadingIndicator.style.display = 'none'; // Hide loading indicator
                break;
        }
    }

    // Fact Finder function
    function fetchFactFinder(query) {
        const wikiEndpoint = `https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&titles=${encodeURIComponent(query)}&exintro=1&explaintext=1`;
        fetch(wikiEndpoint)
            .then(response => response.json())
            .then(data => {
                const pages = data.query.pages;
                const page = Object.values(pages)[0];
                if (page.extract) {
                    const formattedResponse = formatResponse(page.extract);
                    appendMessage('AI', formattedResponse);
                } else {
                    fallbackToGoogleSearch(query);
                }
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            })
            .catch(error => {
                console.error('Error fetching Wikipedia:', error);
                appendMessage('AI', 'Unable to fetch information.');
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            });
    }

    // Format response to be more user-friendly
    function formatResponse(text) {
        const sentences = text.split('.').filter(sentence => sentence.trim().length > 0);
        const bulletPoints = sentences.map(sentence => `<li>${sentence.trim()}.</li>`).join('');
        return `<ul>${bulletPoints}</ul>`;
    }

    // Fallback to Google Custom Search if Wikipedia doesn't return results
    function fallbackToGoogleSearch(query) {
        const googleSearchEndpoint = `https://www.googleapis.com/customsearch/v1?key=YOUR_GOOGLE_API_KEY&cx=YOUR_CUSTOM_SEARCH_ID&q=${encodeURIComponent(query)}`;
        fetch(googleSearchEndpoint)
            .then(response => response.json())
            .then(data => {
                const firstResult = data.items[0];
                if (firstResult) {
                    const snippet = firstResult.snippet.replace(/\.\.\./g, '...').replace(/<\/?b>/g, '');
                    appendMessage('AI', formatResponse(snippet));
                } else {
                    appendMessage('AI', 'No relevant information found.');
                }
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            })
            .catch(error => {
                console.error('Error fetching Google Custom Search:', error);
                appendMessage('AI', 'Unable to fetch information.');
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            });
    }

    // Math Mastermind function
    function solveMath(problem) {
        try {
            const result = eval(problem); // Use a safer math library for production
            appendMessage('AI', `The answer is ${result}`);
        } catch (e) {
            appendMessage('AI', 'Error solving the math problem.');
        }
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }

    // Image Maker function
    function handleImageMaker(prompt) {
        const openAIEndpoint = 'https://api.openai.com/v1/images/generations';
        const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your OpenAI API key

        fetch(openAIEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: '512x512'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                    const imageUrl = data.data[0].url;
                    appendMessage('AI', `<img src="${imageUrl}" alt="Generated Image" style="max-width: 100%; height: auto;">`);
                } else {
                    appendMessage('AI', 'No image generated.');
                }
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            })
            .catch(error => {
                console.error('Error generating image:', error);
                appendMessage('AI', 'Unable to generate image.');
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            });
    }

    // Study Buddy function
    // Study Buddy function
 // Study Buddy function
function handleStudyBuddy(topic) {
    const wikiEndpoint = `https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&titles=${encodeURIComponent(topic)}&exintro=1&explaintext=1`;
    fetch(wikiEndpoint)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const page = Object.values(pages)[0];
            if (page.extract) {
                const formattedStudyMaterial = formatStudyMaterial(page.extract); //grade);
                appendMessage('AI', formattedStudyMaterial);
            } else {
                fallbackToGoogleSearch(topic);
            }
        })
        .catch(error => {
            console.error('Error fetching study material:', error);
            appendMessage('AI', 'Unable to fetch study material.');
        });
}

// Format study material to be more user-friendly
function formatStudyMaterial(text, grade) {
    // Example: Format the study material into bullet points and headers
    const sections = text.split('\n\n').filter(section => section.trim().length > 0);
   let formattedContent =''//`<h3>${grade} Level Study Material</h3>`;
    sections.forEach((section, index) => {
        formattedContent += `<h4>Section ${index + 1}</h4><ul>`;
        const points = section.split('.').filter(point => point.trim().length > 0);
        points.forEach(point => {
            formattedContent += `<li>${point.trim()}.</li>`;
        });
        formattedContent += `</ul>`;
    });
    return formattedContent;
}

// Interactive quiz function
function createInteractiveQuiz(question, correctAnswer, explanation) {
    return `
    <div class="quiz-question">
        <p><strong>${question}</strong></p>
        <ul>
            <li><button onclick="checkAnswer('${correctAnswer}', this)">${correctAnswer}</button></li>
            <li><button onclick="checkAnswer('Incorrect', this)">Incorrect</button></li>
        </ul>
        <div class="quiz-answer"></div>
    </div>`;
}

// Check answer and show explanation
function checkAnswer(correctAnswer, button) {
    const answerDiv = button.parentElement.parentElement.querySelector('.quiz-answer');
    if (button.textContent === correctAnswer) {
        answerDiv.innerHTML = `<p>Correct! ${correctAnswer} is the right answer.</p><ul><li>${explanation}</li></ul>`;
    } else {
        answerDiv.innerHTML = `<p>Incorrect. The correct answer is ${correctAnswer}.</p><ul><li>${explanation}</li></ul>`;
    }
}

    // Introduction when the page loads
    introduceChatBuddy();
});