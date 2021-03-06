import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import NextLink from 'next/link'

const ChangePassword: NextPage = () => {

    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');

    return (
        <Wrapper variant='small'>

            <Formik 
                initialValues={{ newPassword: '' }}
                onSubmit= { async (values, {setErrors}) => {
                    
                    const response = await changePassword( {
                        newPassword: values.newPassword, 
                        token: typeof router.query.token === "string" ? router.query.token : ""} 
                    );

                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors);

                        if ('token' in errorMap) {
                            setTokenError(errorMap.token); // Pass in error message for token
                        }
                        setErrors(errorMap);
                        
                    } else if (response.data?.changePassword.user) {
                        // We got a user back / worked
                        router.push('/');
                    }

                }}
            >
                { ({isSubmitting}) => (
                    <Form>
                        <InputField 
                            name='newPassword' 
                            placeholder='New Password' 
                            label="New Password"
                            type="password"
                        />
                        {tokenError ? 
                        <Flex>
                            <Box mr={2} color='red'>{tokenError}</Box> 
                            <NextLink href="/forgot-password">
                                <Link>
                                Resubmit 'forgot password' email
                                </Link>                    
                            </NextLink>
                        </Flex>
                        : null}
                        <Button 
                            mt={4} 
                            type='submit' 
                            isLoading={isSubmitting} 
                            colorScheme='teal'
                        >
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ChangePassword);