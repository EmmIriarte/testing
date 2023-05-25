const Prompts = {};

Prompts.formal = (postAuthor, post, length) => `
    Create a ${length} size, formal comment response for the post:
    Post author: ${postAuthor} 
    Post text: ${post}

    Response (remember to answer in formal comment style):
`;

Prompts.personal = (postAuthor, post, length) => `
    Create a ${length} size, personal, so friendly comment response for the post:
    Post author: ${postAuthor} 
    Post text: ${post}

    Response (remember to answer in personal, friendly comment style):
`;

Prompts.formalComment = (
  { commentAuthor, commentContent },
  postAuthor,
  post, 
  length
) => `
    Task: Create a ${length} size, formal response for comment corresponding to the post.
    
    ### 

    Comment author: ${commentAuthor}
    Comment text: ${commentContent}

    ### 

    Post author: ${postAuthor}
    Post text: ${post}

    ###

    Response (remember to answer to comment in formal comment style):
    `;

Prompts.personalComment = (
  { commentAuthor, commentContent },
  postAuthor,
  post, 
  length
) => `
    Task: Create a ${length} size, personal, so friendly response for comment corresponding to the post.
    
    ### 

    Comment author: ${commentAuthor}
    Comment text: ${commentContent}

    ### 

    Post author: ${postAuthor}
    Post text: ${post}

    ###

    Response (remember to answer to comment in personal, friendly comment style):
    `;

Prompts.formalMultiple = (authors, posts, length) => `
    Task: Create a ${length} size, formal comment response for the post that is responding to parent post:
    
    ###

    Parent post author: ${authors[1]}
    Parent post text: ${posts[1]}

    ###
    
    Post author: ${authors[0]} 
    Post text: ${posts[0]}

    ###

    Response (remember to answer in formal comment style):
`;

Prompts.personalMultiple = (authors, posts, length) => `
    Task: Create a ${length} size, personal, so friendly comment response for the post that is responding to parent post:
    
    ###

    Parent post author: ${authors[1]}
    Parent post text: ${posts[1]}

    ###
    
    Post author: ${authors[0]} 
    Post text: ${posts[0]}

    ###

    Response (remember to answer in personal, friendly comment style):
`;

Prompts.formalCommentMultiple = (
  { commentAuthor, commentContent },
  authors,
  posts, 
  length
) => `
    Task: Create a ${length} size, formal response for comment corresponding to the posts.
   
    ### 

    Comment author: ${commentAuthor}
    Comment text: ${commentContent}

    ### 
    Parent post author: ${authors[1]}
    Parent post text: ${posts[1]}

    ###
    
    Post author: ${authors[0]} 
    Post text: ${posts[0]}

    ###

    Response (remember to answer to comment in formal comment style):
`;

Prompts.personalCommentMultiple = (
  { commentAuthor, commentContent },
  authors,
  posts, 
  length
) => `
    Task: Create a ${length} size, personal, so friendly response for comment corresponding to the posts.
   
    ### 

    Comment author: ${commentAuthor}
    Comment text: ${commentContent}

    ### 
    Parent post author: ${authors[1]}
    Parent post text: ${posts[1]}

    ###
    
    Post author: ${authors[0]} 
    Post text: ${posts[0]}

    ###

    Response (remember to answer to comment in personal, friendly comment style):
    `;
