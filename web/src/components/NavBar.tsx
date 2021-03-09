import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {

    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(), // run in browser instead of server side
    });
    let body = null;

    // three states - data loading, user not logged, user logged
    if (fetching) {
        body = (
            <div>Loading..</div>
        )
    } else if (!data?.me) {
        body = (
            <>
            <NextLink href="/login"> 
                <Link mr={2}>Login</Link>
            </NextLink>
            <NextLink href="/register">
                <Link>Register</Link>                        
            </NextLink>
            </>
        );
    } else {
        body = (
            <Flex align="center">
                <NextLink href='/create-post'>
                    <Button as={Link} mr={4}>Create Post</Button>
                </NextLink>
                <Box>
                    <Box mr={2}>{data.me.username}</Box>
                    <Button 
                        onClick={ async () => {
                            await logout();
                            router.reload();
                        }}
                        isLoading={logoutFetching}
                        variant="link"                        
                    >
                        Logout
                    </Button>
                </Box>
            </Flex>
        )
        
    }

    return (
        <Flex zIndex={1} position='sticky' top={0} p={4} bg='tan'>
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>Sermohub</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'}> {body} </Box>
            </Flex>
        </Flex>
    );
}