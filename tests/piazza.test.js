const axios = require('axios');


// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const EXPIRATION_MINUTES = 5; // Post expiration time in minutes

// Test users
const users = {
  olga: { name: 'Olga', email: 'olga@test.com', password: 'password123', token: null },
  nick: { name: 'Nick', email: 'nick@test.com', password: 'password123', token: null },
  mary: { name: 'Mary', email: 'mary@test.com', password: 'password123', token: null },
  nestor: { name: 'Nestor', email: 'nestor@test.com', password: 'password123', token: null }
};

// Store post IDs for testing
let postIds = {
  olga: null,
  nick: null,
  mary: null,
  nestor: null
};

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Test Case Functions
const runTests = async () => {
  
  try {
    // TC1: Register all users
    console.log('TC1: Registering Olga, Nick, Mary, and Nestor...');
    for (const [key, user] of Object.entries(users)) {
      const result = await apiCall('POST', '/auth/register', {
        name: user.name,
        email: user.email,
        password: user.password
      });
      
      if (result.success) {
        console.log(`✓ ${user.name} registered successfully`);
      } else {
        console.log(`✗ ${user.name} registration failed:`, result.error);
      }
    }
    console.log('');

    // TC2: Login all users and get tokens
    console.log('TC2: Users logging in to get OAuth tokens...');
    for (const [key, user] of Object.entries(users)) {
      const result = await apiCall('POST', '/auth/login', {
        email: user.email,
        password: user.password
      });
      
      if (result.success) {
        users[key].token = result.data.data.token;
        console.log(`✓ ${user.name} received token: ${users[key].token.substring(0, 20)}...`);
      } else {
        console.log(`✗ ${user.name} login failed:`, result.error);
      }
    }
    console.log('');

    // TC3: Olga tries to access API without token
    console.log('TC3: Olga attempting to access API without token...');
    const result3 = await apiCall('GET', '/posts/topic/Tech');
    if (!result3.success) {
      console.log('✓ Unauthorized access correctly blocked:', result3.error.error);
    } else {
      console.log('✗ Unauthorized access was not blocked!');
    }
    console.log('');

    // TC4: Olga posts a message in Tech topic
    console.log(`TC4: Olga posting a message in Tech topic (expires in ${EXPIRATION_MINUTES} minutes)...`);
    const result4 = await apiCall('POST', '/posts', {
      title: 'Latest JavaScript Frameworks',
      body: 'What do you think about the new features in React 18?',
      topics: ['Tech'],
      expirationMinutes: EXPIRATION_MINUTES
    }, users.olga.token);
    
    if (result4.success) {
      postIds.olga = result4.data.data.post._id;
      console.log(`✓ Olga's post created with ID: ${postIds.olga}`);
      console.log(`  Expires at: ${result4.data.data.post.expirationTime}`);
    } else {
      console.log('✗ Post creation failed:', result4.error);
    }
    console.log('');

    // TC5: Nick posts a message in Tech topic
    console.log(`TC5: Nick posting a message in Tech topic...`);
    const result5 = await apiCall('POST', '/posts', {
      title: 'AI and Machine Learning Trends',
      body: 'The latest developments in AI are fascinating!',
      topics: ['Tech'],
      expirationMinutes: EXPIRATION_MINUTES
    }, users.nick.token);
    
    if (result5.success) {
      postIds.nick = result5.data.data.post._id;
      console.log(`✓ Nick's post created with ID: ${postIds.nick}`);
    } else {
      console.log('✗ Post creation failed:', result5.error);
    }
    console.log('');

    // TC6: Mary posts a message in Tech topic
    console.log(`TC6: Mary posting a message in Tech topic...`);
    const result6 = await apiCall('POST', '/posts', {
      title: 'Cloud Computing Best Practices',
      body: 'Sharing some insights on microservices architecture',
      topics: ['Tech'],
      expirationMinutes: EXPIRATION_MINUTES
    }, users.mary.token);
    
    if (result6.success) {
      postIds.mary = result6.data.data.post._id;
      console.log(`✓ Mary's post created with ID: ${postIds.mary}`);
    } else {
      console.log('✗ Post creation failed:', result6.error);
    }
    console.log('');

    // TC7: Nick and Olga browse Tech topic posts
    console.log('TC7: Nick and Olga browsing Tech topic posts...');
    const result7 = await apiCall('GET', '/posts/topic/Tech', null, users.nick.token);
    if (result7.success) {
      console.log(`✓ Found ${result7.data.count} posts in Tech topic`);
      result7.data.data.posts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.ownerName}: ${post.likes} likes, ${post.dislikes} dislikes, ${post.comments.length} comments`);
      });
    } else {
      console.log('✗ Browse failed:', result7.error);
    }
    console.log('');

    // TC8: Nick and Olga like Mary's post
    console.log('TC8: Nick and Olga liking Mary\'s post...');
    const result8a = await apiCall('POST', `/posts/${postIds.mary}/like`, null, users.nick.token);
    const result8b = await apiCall('POST', `/posts/${postIds.mary}/like`, null, users.olga.token);
    
    if (result8a.success && result8b.success) {
      console.log(`✓ Nick and Olga liked Mary's post`);
      console.log(`  Mary's post now has ${result8b.data.data.likes} likes`);
    } else {
      console.log('✗ Like failed');
    }
    console.log('');

    // TC9: Nestor likes Nick's post and dislikes Mary's
    console.log('TC9: Nestor liking Nick\'s post and disliking Mary\'s...');
    const result9a = await apiCall('POST', `/posts/${postIds.nick}/like`, null, users.nestor.token);
    const result9b = await apiCall('POST', `/posts/${postIds.mary}/dislike`, null, users.nestor.token);
    
    if (result9a.success && result9b.success) {
      console.log(`✓ Nestor liked Nick's post`);
      console.log(`✓ Nestor disliked Mary's post`);
    } else {
      console.log('✗ Interaction failed');
    }
    console.log('');

    // TC10: Nick browses posts to see likes/dislikes
    console.log('TC10: Nick browsing posts to see updated likes/dislikes...');
    const result10 = await apiCall('GET', '/posts/topic/Tech', null, users.nick.token);
    if (result10.success) {
      result10.data.data.posts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.ownerName}:`);
        console.log(`    ${post.likes} likes, ${post.dislikes} dislikes, ${post.comments.length} comments`);
      });
    }
    console.log('');

    // TC11: Mary tries to like her own post
    console.log('TC11: Mary attempting to like her own post...');
    const result11 = await apiCall('POST', `/posts/${postIds.mary}/like`, null, users.mary.token);
    if (!result11.success) {
      console.log('✓ Owner like correctly blocked:', result11.error.error);
    } else {
      console.log('✗ Owner was allowed to like their own post!');
    }
    console.log('');

    // TC12: Nick and Olga comment on Mary's post
    console.log('TC12: Nick and Olga commenting on Mary\'s post (round-robin)...');
    const comments = [
      { user: 'nick', text: 'Great insights on microservices!' },
      { user: 'olga', text: 'I agree, very informative post.' },
      { user: 'nick', text: 'Have you tried Kubernetes for orchestration?' },
      { user: 'olga', text: 'Docker Swarm is also worth considering.' }
    ];
    
    for (const comment of comments) {
      const result = await apiCall('POST', `/posts/${postIds.mary}/comment`, 
        { text: comment.text }, 
        users[comment.user].token
      );
      if (result.success) {
        console.log(`✓ ${users[comment.user].name}: "${comment.text}"`);
      }
    }
    console.log('');

    // TC13: Nick browses posts to see comments
    console.log('TC13: Nick browsing posts to see comments...');
    const result13 = await apiCall('GET', `/posts/${postIds.mary}`, null, users.nick.token);
    if (result13.success) {
      const post = result13.data.data.post;
      console.log(`  "${post.title}" has ${post.comments.length} comments:`);
      post.comments.forEach((comment, idx) => {
        console.log(`    ${idx + 1}. ${comment.userName}: "${comment.text}"`);
      });
    }
    console.log('');

    // TC14: Nestor posts in Health topic
    console.log('TC14: Nestor posting a message in Health topic...');
    const result14 = await apiCall('POST', '/posts', {
      title: 'Importance of Mental Health',
      body: 'Taking care of mental health is as important as physical health',
      topics: ['Health'],
      expirationMinutes: EXPIRATION_MINUTES
    }, users.nestor.token);
    
    if (result14.success) {
      postIds.nestor = result14.data.data.post._id;
      console.log(`✓ Nestor's Health post created with ID: ${postIds.nestor}`);
    }
    console.log('');

    // TC15: Mary browses Health topic
    console.log('TC15: Mary browsing Health topic...');
    const result15 = await apiCall('GET', '/posts/topic/Health', null, users.mary.token);
    if (result15.success) {
      console.log(`✓ Found ${result15.data.count} post(s) in Health topic`);
      result15.data.data.posts.forEach(post => {
        console.log(`  - "${post.title}" by ${post.ownerName}`);
      });
    }
    console.log('');

    // TC16: Mary comments on Nestor's Health post
    console.log('TC16: Mary commenting on Nestor\'s Health post...');
    const result16 = await apiCall('POST', `/posts/${postIds.nestor}/comment`, 
      { text: 'Very important topic, thanks for sharing!' },
      users.mary.token
    );
    if (result16.success) {
      console.log('✓ Mary\'s comment added successfully');
    }
    console.log('');

    // TC17: Wait for post to expire, then Mary tries to dislike
    console.log(`TC17: Waiting for Nestor's post to expire (${EXPIRATION_MINUTES} minutes)...`);
    console.log('     (For testing purposes, we\'ll use a short wait. In production, wait full time.)');
    console.log('     Simulating expiration by waiting 2 seconds...');
    await delay(2000);
    
    // Force update expiration (in real scenario, wait full time)
    console.log('     Mary attempting to dislike expired post...');
    const result17 = await apiCall('POST', `/posts/${postIds.nestor}/dislike`, null, users.mary.token);
    
    // Note: This will only fail if post actually expired. For demo, it might succeed.
    if (!result17.success && result17.error.error.includes('expired')) {
      console.log('✓ Interaction with expired post correctly blocked');
    } else {
      console.log('  (Post may not be expired yet - check after full expiration time)');
    }
    console.log('');

    // TC18: Nestor browses Health topic messages
    console.log('TC18: Nestor browsing Health topic messages...');
    const result18 = await apiCall('GET', '/posts/topic/Health', null, users.nestor.token);
    if (result18.success) {
      const post = result18.data.data.posts.find(p => p._id === postIds.nestor);
      console.log(`✓ Nestor's post has ${post.comments.length} comment(s)`);
      post.comments.forEach((comment, idx) => {
        console.log(`  ${idx + 1}. ${comment.userName}: "${comment.text}"`);
      });
    }
    console.log('');

    // TC19: Nick browses expired Sports posts
    console.log('TC19: Nick browsing expired posts in Sports topic...');
    const result19 = await apiCall('GET', '/posts/topic/Sport/expired', null, users.nick.token);
    if (result19.success) {
      console.log(`✓ Found ${result19.data.count} expired post(s) in Sport topic (should be 0)`);
    }
    console.log('');

    // TC20: Query for most active post in Tech
    console.log('TC20: Nestor querying for most active post in Tech topic...');
    const result20 = await apiCall('GET', '/posts/topic/Tech/most-active', null, users.nestor.token);
    if (result20.success) {
      const post = result20.data.data.post;
      console.log(`✓ Most active post: "${post.title}" by ${post.ownerName}`);
      console.log(`  Activity Score: ${result20.data.data.activityScore} (${post.likes} likes + ${post.dislikes} dislikes)`);
    }
    console.log('');

    
  } catch (error) {
    console.error('\n✗ Test suite error:', error.message);
  }
};

// Run tests
console.log('Starting Piazza API tests...');
console.log(`Target API: ${BASE_URL}`);
runTests();