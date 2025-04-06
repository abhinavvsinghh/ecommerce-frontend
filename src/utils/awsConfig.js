import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: 'us-east-2',
        userPoolId: 'us-east-2_EB9d7nP5j',
        userPoolClientId: '30ik4vbmia1l63q3h1am8mpnhq'
      }
    }
  });
};