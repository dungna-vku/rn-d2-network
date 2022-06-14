import {USERS} from './users';

export const POSTS = [
  {
    avatar: USERS[0].image,
    user: USERS[0].user,
    time: '10:45',
    caption: 'Test Post',
    imageURL:
      'https://scontent.fdad3-5.fna.fbcdn.net/v/t1.6435-9/149694467_768314727142599_5397613978514962473_n.jpg?_nc_cat=111&ccb=1-5&_nc_sid=e3f864&_nc_ohc=lW2Joox-TxAAX9VGc28&_nc_ht=scontent.fdad3-5.fna&oh=66e6b863b1843a987bb9414be694315d&oe=61CBB220',
    likes: 7870,
    comments: [
      {
        user: 'user1',
        comment: 'Test comment',
      },
      {
        user: 'user1',
        comment: 'Test comment',
      },
    ],
  },
  {
    imageURL:
      'https://scontent.fdad3-4.fna.fbcdn.net/v/t1.6435-9/148134713_767408933899845_5299132383880918420_n.jpg?_nc_cat=104&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=eZBmMXJ4FcYAX9L0gR1&tn=wPaBF4QMk_Wq4jTW&_nc_ht=scontent.fdad3-4.fna&oh=d0d93aeae07b63a5bb380e12f707decd&oe=61CC8FBC',
    user: USERS[0].user,
    likes: 7870,
    caption: 'Test Post 1',
    time: '12:00',
    avatar: USERS[0].image,
    comments: [],
  },
  {
    imageURL:
      'https://scontent.fdad3-4.fna.fbcdn.net/v/t1.6435-9/148134713_767408933899845_5299132383880918420_n.jpg?_nc_cat=104&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=eZBmMXJ4FcYAX9L0gR1&tn=wPaBF4QMk_Wq4jTW&_nc_ht=scontent.fdad3-4.fna&oh=d0d93aeae07b63a5bb380e12f707decd&oe=61CC8FBC',
    user: USERS[0].user,
    time: '10:45',
    avatar: USERS[0].image,
    likes: 7870,
    caption: 'Test Post 2',
    comments: [
      {
        user: 'user1',
        comment: 'Test comment',
      },
    ],
  },
];
