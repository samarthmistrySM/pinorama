let selectedUserId;

function selectUser(userId) {
  selectedUserId = userId;
  fetchUserData();
}

async function fetchUserData() {
  if (selectedUserId) {
    try {
      const response = await fetch(`/user/${selectedUserId}`);
      const userData = await response.json();
      renderUserData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
}

function renderUserData(userData) {
  // Get the container for user data
  const userdataContainer = document.querySelector(".userdata");
  let imagesHTML = "";

  // Generate HTML for user's posts
  userData.posts.forEach((post) => {
    imagesHTML += `<div class="post">
                      <img src="/images/uploads/${post.image}" alt="${post.imageText}">
                      <p>${post.imageText}</p>
                  </div>`;
  });

  // Generate HTML for user profile
  const userHTML = `
    <div class="user-profile flex">
    <img src="${userData.dp}" alt="" />
    <div class="data">
        <h2>${userData.username}</h2>
        <p>Email: ${userData.email}</p>
        <p>Full Name: ${userData.fullname}</p>
        <p>Posts: ${userData.posts.length}</p>
    </div>
        </div>

        <div class="user-posts">
            ${imagesHTML}
    </div>`;

  // Set the innerHTML of the container with user data
  userdataContainer.innerHTML = userHTML;
}


async function handleSearch() {
  const searchInput = document.getElementById("search-user").value;
  const searchSuggestionContainer = document.querySelector(".serach-suggesion");

  searchSuggestionContainer.innerHTML = "";

  if (searchInput.trim() !== "") {
    try {
      const response = await fetch(`/search?query=${searchInput}`);
      const searchResults = await response.json();

      searchResults.forEach((user) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.textContent = user.username;
        suggestionItem.addEventListener("click", () => selectUser(user._id));
        searchSuggestionContainer.appendChild(suggestionItem);
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }
}
