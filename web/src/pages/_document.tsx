import Document, { Html, Head, Main, NextScript } from 'next/document';
import { Box } from "@chakra-ui/react"


export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }
  render() {
    return (
      <Html>
        <Head>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet"/>
        </Head>
        <Box h="100vh" bgColor="#303030">
            <body>
                <Main />

                <NextScript />
            </body>

        </Box>
      </Html>
    );
  }
}