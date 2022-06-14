import React, {useState, useEffect} from 'react';
import {View, Text, Image, FlatList, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ChatContent = ({user, email}) => {
  const [chatItems, setChatItems] = useState([]);

  // Lấy danh sách tin nhắn
  useEffect(() => {
    try {
      let isSubcribed = true;

      firestore()
        .collection('users')
        .doc(auth().currentUser.email)
        .collection('chats')
        .doc(email)
        .collection('messages')
        .orderBy('sentAt', 'desc')
        .onSnapshot(async snapshot => {
          if (isSubcribed) {
            setChatItems(
              snapshot.docs.map(item => {
                return {id: item.id, data: item.data()};
              }),
            );
          }
        });

      return () => {
        isSubcribed = false;
        console.log('[SYS] Clean up - Chat');
      };
    } catch (error) {
      console.log('[SYS] Permission denied - Chat');
    }
  }, [email]);

  const renderItem = ({item}) => {
    // Điều chỉnh kích thước ảnh cho phù hợp
    const imageWidth =
      item.data.imageWidth >= item.data.imageHeight ? 220 : 180;
    const imageHeight = Math.round(
      (imageWidth * item.data.imageHeight) / item.data.imageWidth,
    );
    // Lấy ra ngày và thời gian của tin nhắn
    const datetime = new Date(item.data.sentAt);
    const newDatetime = new Date();
    const date = datetime.getDate();
    const month = datetime.getMonth() + 1;
    const year = datetime.getFullYear();
    const sentDate =
      date === newDatetime.getDate() &&
      month === newDatetime.getMonth() + 1 &&
      year === newDatetime.getFullYear()
        ? ''
        : `${date}/${month}/${year}`;
    const sentTime = `${datetime.getHours()}:${
      datetime.getMinutes() < 10 ? '0' : ''
    }${datetime.getMinutes()}`;

    // Nếu là tin nhắn cuộc gọi
    if (item.data.type) {
      // Nếu là cuộc gọi nhỡ
      if (item.data.content === 'Cuộc gọi nhỡ') {
        // Cuộc gọi nhỡ từ người gửi
        if (item.data.sender === auth().currentUser.uid) {
          return (
            <View style={styles.rowMsgRight}>
              <View style={styles.msgTimeContainer}>
                {sentDate !== '' && (
                  <Text style={styles.msgTime} multiline={true}>
                    {sentDate}
                  </Text>
                )}
                <Text style={styles.msgTime} multiline={true}>
                  {sentTime}
                </Text>
              </View>
              <View style={styles.leftMsg}>
                <View style={styles.missedVideoCall}>
                  <Image
                    source={require('../../assets/video-call-missed.png')}
                    style={styles.videoCallIcon}
                  />
                </View>
                <Text style={styles.videoCallText}>{item.data.content}</Text>
              </View>
            </View>
          );
        } else {
          // Cuộc gọi nhỡ từ người nhận
          return (
            <View style={styles.rowMsgLeft}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: user && user.profilePicture,
                  }}
                  style={styles.avatarImage}
                />
              </View>

              <View style={styles.leftMsg}>
                <View style={styles.missedVideoCall}>
                  <Image
                    source={require('../../assets/video-call-missed.png')}
                    style={styles.videoCallIcon}
                  />
                </View>
                <Text style={styles.videoCallText}>{item.data.content}</Text>
              </View>

              <View style={styles.msgTimeContainer}>
                {sentDate !== '' && (
                  <Text style={styles.msgTime} multiline={true}>
                    {sentDate}
                  </Text>
                )}
                <Text style={styles.msgTime} multiline={true}>
                  {sentTime}
                </Text>
              </View>
            </View>
          );
        }
      } else {
        // Thời lượng cuộc gọi
        const hour = Math.floor(item.data.length / 3600);
        const minute = Math.floor((item.data.length - hour * 3600) / 60);
        const second = item.data.length - hour * 3600 - minute * 60;
        let length;
        if (hour > 0) {
          length =
            hour +
            (hour === 1 ? ' hr' : ' hrs') +
            minute +
            (minute <= 1 ? ' min' : ' mins');
        } else if (minute > 0) {
          length = minute + (minute <= 1 ? ' min' : ' mins');
        } else {
          length = second + (second <= 1 ? ' sec' : ' secs');
        }

        // Chat video từ người gửi
        if (item.data.sender === auth().currentUser.uid) {
          return (
            <View style={styles.rowMsgRight}>
              <View style={styles.msgTimeContainer}>
                {sentDate !== '' && (
                  <Text style={styles.msgTime} multiline={true}>
                    {sentDate}
                  </Text>
                )}
                <Text style={styles.msgTime} multiline={true}>
                  {sentTime}
                </Text>
              </View>
              <View style={styles.leftMsg}>
                <View style={styles.acceptedVideoCall}>
                  <Image
                    source={require('../../assets/video-call-success.png')}
                    style={styles.videoCallIcon}
                  />
                </View>
                <View style={styles.acceptedText}>
                  <Text style={styles.videoCallText}>{item.data.content}</Text>
                  <Text style={styles.videoCallLength}>{length}</Text>
                </View>
              </View>
            </View>
          );
        } else {
          // Chat video từ người nhận
          return (
            <View style={styles.rowMsgLeft}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: user && user.profilePicture,
                  }}
                  style={styles.avatarImage}
                />
              </View>

              <View style={styles.leftMsg}>
                <View style={styles.acceptedVideoCall}>
                  <Image
                    source={require('../../assets/video-call-success.png')}
                    style={styles.videoCallIcon}
                  />
                </View>
                <View style={styles.acceptedText}>
                  <Text style={styles.videoCallText}>{item.data.content}</Text>
                  <Text style={styles.videoCallLength}>{length}</Text>
                </View>
              </View>

              <View style={styles.msgTimeContainer}>
                {sentDate !== '' && (
                  <Text style={styles.msgTime} multiline={true}>
                    {sentDate}
                  </Text>
                )}
                <Text style={styles.msgTime} multiline={true}>
                  {sentTime}
                </Text>
              </View>
            </View>
          );
        }
      }
    } else {
      // Hiển thị in nhắn của người nhận
      return item.data.sender !== auth().currentUser.uid ? (
        item.data.imageURL !== '' ? (
          // Tin nhắn hình ảnh
          <View style={styles.rowMsgLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user && user.profilePicture,
                }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.leftImage}>
              <Image
                source={{
                  uri: item.data.imageURL,
                }}
                style={[
                  styles.msgImage,
                  {
                    width: imageWidth,
                    height: imageHeight,
                  },
                ]}
              />
            </View>
            <View style={styles.msgTimeContainer}>
              {sentDate !== '' && (
                <Text style={styles.msgTime} multiline={true}>
                  {sentDate}
                </Text>
              )}
              <Text style={styles.msgTime} multiline={true}>
                {sentTime}
              </Text>
            </View>
          </View>
        ) : (
          // Tin nhắn văn bản
          <View style={styles.rowMsgLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user && user.profilePicture,
                }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.leftMsg}>
              <Text style={styles.leftMsgText}>{item.data.content}</Text>
            </View>
            <View style={styles.msgTimeContainer}>
              {sentDate !== '' && (
                <Text style={styles.msgTime} multiline={true}>
                  {sentDate}
                </Text>
              )}
              <Text style={styles.msgTime} multiline={true}>
                {sentTime}
              </Text>
            </View>
          </View>
        )
      ) : // Hiển thị tin nhắn của người gửi
      item.data.imageURL !== '' ? (
        // Tin nhắn hình ảnh
        <View style={styles.rowMsgRight}>
          <View style={styles.msgTimeRightContainer}>
            {sentDate !== '' && (
              <Text style={styles.msgTime} multiline={true}>
                {sentDate}
              </Text>
            )}
            <Text style={styles.msgTime} multiline={true}>
              {sentTime}
            </Text>
          </View>
          <View style={styles.rightImage}>
            <Image
              source={{
                uri: item.data.imageURL,
              }}
              style={[
                styles.msgImage,
                {
                  width: imageWidth,
                  height: imageHeight,
                },
              ]}
            />
          </View>
        </View>
      ) : (
        // Tin nhắn văn bản
        <View style={styles.rowMsgRight}>
          <View style={styles.msgTimeRightContainer}>
            {sentDate !== '' && (
              <Text style={styles.msgTime} multiline={true}>
                {sentDate}
              </Text>
            )}
            <Text style={styles.msgTime} multiline={true}>
              {sentTime}
            </Text>
          </View>
          <LinearGradient
            colors={['#896AF3', '#53B8F7']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.rightMsg}>
            <Text style={styles.rightMsgText}>{item.data.content}</Text>
          </LinearGradient>
        </View>
      );
    }
  };

  return (
    <FlatList
      inverted
      data={chatItems}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  rowMsgLeft: {
    maxWidth: '65%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },

  avatarContainer: {
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginLeft: 15,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  leftImage: {
    borderRadius: 50,
    marginHorizontal: 10,
  },

  leftMsg: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'lightgray',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  missedVideoCall: {
    width: 40,
    height: 40,
    marginRight: 10,
    padding: 5,
    backgroundColor: 'tomato',
    borderRadius: 100,
  },

  acceptedVideoCall: {
    width: 40,
    height: 40,
    marginRight: 10,
    padding: 5,
    backgroundColor: '#777',
    borderRadius: 100,
  },

  videoCallIcon: {
    width: '100%',
    height: '100%',
  },

  videoCallText: {
    fontSize: 16,
    fontWeight: '700',
  },

  videoCallLength: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
  },

  leftMsgText: {
    fontSize: 16,
  },

  msgImage: {
    borderRadius: 20,
  },

  msgTime: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },

  rowMsgRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
  },

  rightMsg: {
    padding: 15,
    borderRadius: 20,
    // backgroundColor: '#1978F2',
    marginRight: 15,
    marginLeft: 10,
    maxWidth: '70%',
  },

  rightImage: {
    // alignSelf: 'flex-end',
    marginRight: 15,
    marginLeft: 10,
  },

  rightMsgText: {
    color: 'white',
    fontSize: 16,
  },

  msgTimeRightContainer: {
    alignItems: 'flex-end',
  },
});

export default ChatContent;
