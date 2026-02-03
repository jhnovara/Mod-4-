const postListEl = document.querySelector(".post-list");
const breweryId = localStorage.getItem("name");

async function renderPost() {
  if (!breweryId) return;

  const response = await fetch(
    `https://api.openbrewerydb.org/v1/breweries/${breweryId}`
  );

  const data = await response.json();
  postListEl.innerHTML = postHTML(data);
}

function postHTML(post) {
  return `
    <div class="post">
        <div class="post__title">
            ${post.name}
        </div>
        <p><b>Type:</b> ${post.brewery_type}</p>
        <p><b>Phone:</b> ${post.phone}</p>
        <p><b>Address:</b> ${post.street}, ${post.city}, ${post.state}</p>
    </div>
  `;
}

renderPost();