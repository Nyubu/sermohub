import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';
import { UseIsAuth } from '../../../utils/UseIsAuth';


const EditPost = ({}) => {    

    const intId = useGetIntId();
    const router = useRouter();
    UseIsAuth();
    const [{data, error, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        },
    });
    const [,updatePost] = useUpdatePostMutation();

    if (fetching) {
        return (
            <Layout>
                <div>Loading. . .</div>
            </Layout>
        )
    }

    if (error) {
        return <div>{error.message}</div>
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find post</Box>
            </Layout>
        )
    }

    return (
        <Layout variant='small'>

            <Formik 
                initialValues={{ title: data.post.title, text: data.post.text }} // Auto fill contents
                onSubmit= { async (values) => {

                    await updatePost({ id: intId, ...values })

                    router.back();
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
                        Update Post
                    </Button>
                </Form>
            )}
        </Formik>
    </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost);