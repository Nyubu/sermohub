import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import React from 'react'
import { InputField } from '../components/InputField';
import { useCreatePostMutation, } from '../generated/graphql';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';
import { UseIsAuth } from '../utils/UseIsAuth';

const createPost: React.FC<{}> = ({}) => {

    const router = useRouter();
    UseIsAuth();
    const [,createPost] = useCreatePostMutation();

    return (
        <Layout variant='small'>

            <Formik 
                initialValues={{ title: '', text: ''}}
                onSubmit= { async (values) => {
                    const {error} = await createPost({input: values});
                    if (!error) {
                        router.push('/')
                    } else {
                        console.log(error);
                    }
                }}
            >
                { ({isSubmitting}) => (
                <Form>
                    <InputField 
                        name='title' 
                        placeholder='Title' 
                        label="Title"
                    />
                    <Box mt={4}>
                        <InputField 
                            textarea
                            name='text' 
                            placeholder='Text...' 
                            label="Body"
                    />
                    </Box>
                    <Button 
                        mt={4} 
                        type='submit' 
                        isLoading={isSubmitting} 
                        colorScheme='teal'
                    >
                        Create Post
                    </Button>
                </Form>
            )}
        </Formik>
    </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(createPost);