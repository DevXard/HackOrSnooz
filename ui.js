$(async function() {
  // cache some selectors we'll be using quite a bit
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");
  //get array of favorite storyes
  
  // global storyList variable
  let storyList = null;

  // global currentUser variable
  let currentUser = null;

  await checkIfLoggedIn();

  /**todos
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */

  $loginForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page-refresh on submit

    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */

  $createAccountForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page refresh

    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Log Out Functionality
   */

  $navLogOut.on("click", function() {
    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   */

  $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });

  /**
   * Event handler for Navigation to Homepage
   */

  $("body").on("click", "#nav-all", async function() {
    hideElements();
    await generateStories();
    $allStoriesList.show();
  });

  /**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */

  async function checkIfLoggedIn() {
    // let's see if we're logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if there is a token in localStorage, call User.getLoggedInUser
    //  to get an instance of User with the right details
    //  this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    await generateStories();

    if (currentUser) {
      showNavForLoggedInUser();
    }
  }

  /**
   * A rendering function to run to reset the forms and hide the login info
   */

  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();

    // update the navigation bar
    showNavForLoggedInUser();
  }

  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */

  async function generateStories() {
    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update our global variable
    storyList = storyListInstance;
    // empty out that part of the page
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
    }
    chack()
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story) {
    let hostName = getHostName(story.url);

    // render story markup
    const storyMarkup = $(`
      
      <li id="${story.storyId}">
      <i class="far fa-star"></i>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>  ${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
        <a class="delete-button">Delete</a>
      </li>
    `);

    return storyMarkup;
  }

  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  //create buttons for newPost submition favorytes and my storyes
  function showHidenEl(){
    $('nav').append(`<a id="new-story" class="util">submit</a>`)
    $('nav').append(`<a class="util">favorites</a>`)
    $('nav').append(`<a class="util">my storyes</a>`)
  }

  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navLogOut.show();
    showHidenEl();
  }

  /* simple function to pull the hostname from a URL */

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  /* sync current user information to localStorage */

  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
});

//show and hide sublit from
$('body').on('click', '#new-story', function(){
  $('#submit-form').toggleClass('hidden')
})

//use submit form to create new post
$('#submit-form').on('submit', async function(e){
  e.preventDefault();
  //get object and token for the API get request
  let author = $('#author').val();
  let title = $('#title').val();
  let url = $('#url').val();
  let user = localStorage.getItem('token')
  let story = {
    author,
    title,
    url
  }
  //invoce addStory from Api-classes.js
  let newStory = await new StoryList();
   newStory.addStory(user, story)
  
})

//create favorite function

async function chack(){
  let li = await $('#all-articles-list li');
  let favArr = JSON.parse(localStorage.getItem('favorites'))
  
  for(let id of li){
    if(favArr.includes(id.id)){
      $(`#${id.id} i`).addClass('star')
    }
  }
}


let arrOfFavorites = JSON.parse(localStorage.getItem('favorites'))

$('#all-articles-list').on('click', 'i', function(){
  
  let id = $(this).parent().attr('id')
  console.log(id)
  if(!arrOfFavorites.includes(id)){
    $(this).toggleClass('star')
    arrOfFavorites.push(id)
  }else if (arrOfFavorites.includes(id)){
    let index = arrOfFavorites.indexOf(id)
    arrOfFavorites.splice(index, 1)
    $(this).toggleClass('star')
  }
  localStorage.setItem('favorites', JSON.stringify(arrOfFavorites))
})

//delete function
$('#all-articles-list').on('click', '.delete-button', async function(){
  // console.log($(this).parent().attr('id'))
  let id = $(this).parent().attr('id');
  let user = localStorage.getItem('token')
  console.log(id)
  console.log(user)
  let newStory = await new StoryList();
  newStory.deleteStory(id, user)

  $(this).parent().remove()

})

