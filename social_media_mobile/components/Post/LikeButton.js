import { View, Text } from 'react-native'
import React, {useState} from 'react' 
import ReactionButton from '@luu-truong/react-native-reaction-button'

const LikeButton = () => {

    const [value, setValue] = React.useState(-1);

    function onChange(index) {
        setValue(value === index ? -1 : index);
    }

    // handle like

    const reactions = [
        {
          source: {
            uri: 'https://w7.pngwing.com/pngs/260/468/png-transparent-facebook-reaction-like-hd-logo-thumbnail.png'
          },
          title: 'Like'
        },
        {
          source: 
          {
            uri: 'https://e7.pngegg.com/pngimages/540/262/png-clipart-white-heart-social-media-facebook-like-button-heart-emoticon-facebook-live-love-miscellaneous-text-thumbnail.png'
          },
          title: 'Love'
        },
        {
          source: 
          {
            uri: 'https://w7.pngwing.com/pngs/409/185/png-transparent-happy-emoji-facebook-like-button-emoji-emoticon-haha-smiley-logos-long-time-no-see-thumbnail.png'
          },
          title: 'Haha'
        },
        {
          source: 
          {
            uri: 'https://w7.pngwing.com/pngs/767/188/png-transparent-facebook-reaction-wow-hd-logo.png'
          },
          title: 'Wow'
        },
        {
          source: 
          {
            uri: 'https://iconape.com/wp-content/png_logo_vector/facebook-reaction-sad.png'
          },
          title: 'Sad'
        },
        {
          source: 
          {
            uri: 'https://w7.pngwing.com/pngs/74/788/png-transparent-angry-facebook-reaction-emoji-anger-social-media-facebook-emoji-react-blushing-emoji-love-face-orange.png'
          },
          title: 'Angry'
        }
      ];
  return (
    <ReactionButton reactions={reactions} defaultIndex={0} value={value} onChange={onChange} />

  )
}

export default LikeButton