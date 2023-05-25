/**
 * Call OpenAI API and get response
 * @param {*} prompt // Prompt for GPT-3
 * @param {*} options // settings for max_tokens, temperature, top_p, n (see https://beta.openai.com/docs/api-reference/completions/create)
 * @returns {Promise} // Promise with response from OpenAI API
 */

console.log("API JS RUNNING");

async function getResponse(prompt, options) {
  const gptOptions = JSON.stringify({
    prompt,
    max_tokens: options?.max_tokens || 100,
    temperature: parseFloat(options?.temperature) || 0.7,
    top_p: options?.top_p || 1,
    n: options?.n || 1,
  });

  const reqBody = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Organization": `${ORGANISATION_ID}`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    },
    body: gptOptions,
    redirect: "follow",
  };

  let response = await fetch(
    "https://api.openai.com/v1/engines/text-davinci-003/completions",
    reqBody
  );
  response = response.json();

  // Sending whole response, because GPT-3 can generate couple of examples and maybe we would like to choose first or last or random
  return response;
}
