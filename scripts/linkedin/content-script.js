let commentBoxes = [];
let filledCommentBoxes = [];

function findParentArticle(e) {
  let targetElement = e.target.parentElement;
  let tries = 1;
  let foundParentPost = false;
  while (tries <= 35) {
    foundParentPost = targetElement?.classList?.contains('feed-shared-update-v2');

    if (foundParentPost) break;
    else {
      targetElement = targetElement?.parentElement;
      tries++;
    }
  }

  const text = targetElement
    .querySelector('.feed-shared-update-v2__description')
    ?.textContent?.trimEnd();

  return foundParentPost && text ? targetElement : false;
}

function findComment(event) {
  let targetElement = event.target.parentElement;
  let tries = 1;
  let foundComment = false;
  while (tries <= 35) {
    foundComment = targetElement?.classList?.contains('comments-comment-item');
    if (foundComment) break;
    else {
      targetElement = targetElement?.parentElement;
      tries++;
    }
  }

  if (foundComment) {
    const comment =
      targetElement.querySelector('.comments-comment-item-content-body') ||
      targetElement.querySelector('.comments-comment-item');

    const commentContent = comment?.querySelector('.update-components-text')?.textContent?.trim();
    const commentAuthor = comment.parentElement
      ?.querySelector('.comments-post-meta')
      ?.querySelector('.comments-post-meta__name-text > span > span')
      .textContent?.trim();

    const commentData = {
      commentAuthor,
      commentContent,
    };

    return commentAuthor && commentContent ? commentData : false;
  } else return false;
}

async function parseArticle(event) {
  event.preventDefault();
  event.stopPropagation();
  const targetElement = findParentArticle(event);

  if (targetElement) {
    // look for comments
    const commentElement = findComment(event);
    const { commentAuthor, commentContent } = commentElement;

    let authors = [
      targetElement.querySelector('.update-components-actor__name')?.textContent?.trim(),
    ];
    let texts = [
      targetElement.querySelector('.update-components-text > .break-words')?.textContent?.trim(),
    ];

    if (commentAuthor) authors.push(commentAuthor);
    if (commentContent && commentAuthor) texts.push(commentContent);

    return {
      authors,
      texts,
      comment: commentElement,
    };
  } else {
    alert('Article not found!');
    return null;
  }
}

const parsePrompts = async ({ authors, texts, comment }) => {
  // get data from local storage
  const data = await chrome.storage.local.get(['temperature', 'style', 'length']);

  let prompt;
  if (texts.length === 2 && (authors.length === 1 || authors.length === 2)) {
    prompt = comment
      ? data.style === 'formal'
        ? Prompts.formalCommentMultiple(comment, authors, texts, data.length)
        : Prompts.personalCommentMultiple(comment, authors, texts, data.length)
      : data.style === 'formal'
      ? Prompts.formalMultiple(authors, texts, data.length)
      : Prompts.personalMultiple(authors, texts, data.length);
  } else if (texts.length === 1) {
    const text = texts[0];

    // .pop() here, because if there are two authors we want to take 2nd one (in case length(authors) == 2)
    const textAuthor = authors.pop();

    prompt = comment
      ? data.style === 'formal'
        ? Prompts.formalComment(comment, textAuthor, text, data.length)
        : Prompts.personalComment(comment, textAuthor, text, data.length)
      : data.style === 'formal'
      ? Prompts.formal(textAuthor, text, data.length)
      : Prompts.personal(textAuthor, text, data.length);

    // There can't be more than 2 authors
  }

  return prompt;
};

function findReplyButton(e) {
  let targetElement = e.target;
  let tries = 1;
  let foundParentPost = false;
  while (tries <= 10) {
    console.log(targetElement);
    foundParentPost = targetElement?.classList?.contains('nn-button');

    if (foundParentPost) break;
    else {
      targetElement = targetElement?.parentElement;
      tries++;
    }
  }

  return targetElement;
}

async function createChoicesPopupElement(event, dataArticles) {
  const prompt = await parsePrompts(dataArticles);

  const popup = document.createElement('div');

  const autoReplyButton = findReplyButton(event);
  const textBox = autoReplyButton.parentElement.parentElement.querySelector('.ql-editor p');

  popup.className = 'nn-choices-popup';

  // elements for popup
  const loader = document.createElement('div');
  loader.className = 'nn-loader';

  const closeButton = document.createElement('button');
  closeButton.className = 'nn-popup-close-button';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    event.stopPropagation();
    popup.remove();
  });

  const headerContainer = document.createElement('div');
  headerContainer.className = 'nn-popup-header-container';

  popup.appendChild(headerContainer);
  popup.appendChild(closeButton);
  popup.appendChild(loader);

  // button for re generating the answer, with loop icon
  const regenerateButton = document.createElement('button');
  regenerateButton.className = 'nn-popup-regenerate-button';
  regenerateButton.innerHTML = '&#8635;';
  regenerateButton.addEventListener('click', async (event) => {
    event.stopPropagation();

    // clear previous response from p tag from popup
    popup.querySelector('p')?.remove();
    popup.querySelector('.nn-choice-header')?.remove();
    regenerateButton.remove();

    // add loader
    popup.appendChild(loader);

    // get prompt
    const prompt = await parsePrompts(dataArticles);

    const { style, temperature } = await chrome.storage.local.get(['style', 'temperature']);

    // get response
    const response = await getResponse(prompt, { temperature })
      .then((response) => response?.choices?.pop() || 'OpenAI API error')
      .catch((error) => console.error(error));

    if (!response) {
      console.log('No choices returned');
      loader.remove();
      return;
    }

    loader.remove();

    // display responsec
    createChoice(popup, response, style, textBox);
  });

  chrome.storage.onChanged.addListener(function (changes) {
    popup.querySelectorAll('.nn-popup-regenerate-button').forEach((e) => e.remove());
    popup.appendChild(regenerateButton);
  });

  // insert popups after the button
  autoReplyButton.insertAdjacentElement('afterend', popup);

  const { style, temperature } = await chrome.storage.local.get(['style', 'temperature']);

  const response = await getResponse(prompt, {
    temperature,
  })
    .then((response) => response?.choices?.pop() || 'OpenAI API error')
    .catch((error) => console.error(error));

  if (!response) {
    console.log('No choices returned');
    loader.remove();
    return;
  }

  createChoice(popup, response, style, textBox);

  loader.remove();
}

function createChoice(popup, choice, index, textBox) {
  choice.text = (choice.text || choice).trim();

  const choiceHeader = document.createElement('h4');
  choiceHeader.classList.add('nn-choice-header');
  choiceHeader.dataset.index = index;

  choiceHeader.innerHTML = (index || 'Personal')?.toUpperCase();

  const choiceElement = document.createElement('p');
  choiceElement.classList.add('nn-choice-element');

  choiceElement.innerHTML = choice.text;
  choiceElement.title = 'Click here to copy this text';

  // Crete copy function
  choiceElement.addEventListener(
    'click',
    (event) => {
      event.stopPropagation();
      textBox.innerHTML = choice.text;
      popup.remove();
    },
    false,
  );

  // Add content
  popup.querySelector('.nn-popup-header-container').appendChild(choiceHeader);
  popup.appendChild(choiceElement);
}

function insertAutoReplyButton(commentBox) {
  if (!filledCommentBoxes.some((commentBoxId) => commentBox.id === commentBoxId)) {
    const autoReplyButton = document.createElement('button');
    autoReplyButton.className = 'nn-button';
    autoReplyButton.type = 'button';
    autoReplyButton.title = 'Reply with New Native AI';
    autoReplyButton.innerHTML = Elements.postReplyButton();
    commentBox.querySelector('.comments-comment-texteditor .mlA').appendChild(autoReplyButton);
    filledCommentBoxes.push(commentBox.id);
    autoReplyButton.addEventListener(
      'click',
      async (event) => {
        const dataArticles = await parseArticle(event);
        if (!dataArticles) return;

        createChoicesPopupElement(event, dataArticles);
      },
      false,
    );
  }
}

function getLinkedinCommentBoxes() {
  const commentBoxElements = document.querySelectorAll('.comments-comment-box');
  commentBoxes = Array.from(new Set([...commentBoxElements]));
  console.log(`${commentBoxes.length} comment box${commentBoxes.length === 1 ? '' : 'es'} found`);

  commentBoxes.forEach((commentBox) => {
    insertAutoReplyButton(commentBox);
  });
}

window.onload = async () => {
  getLinkedinCommentBoxes();
};

window.addEventListener('scroll', debounce(getLinkedinCommentBoxes, 300));
