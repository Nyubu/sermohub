import { Flex, IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

// 
interface UpdootSectionProps {
    // post: PostsQuery['posts']['posts'][0];
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => { // whole

    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [ ,vote] = useVoteMutation();

    return (
            <Flex fontFamily="Poppins" direction="column" justifyContent="center" alignItems="center" mr={4}>
                <IconButton 
                    onClick={async () => {
                        if (post.voteStatus === 1) {
                            return;
                        }
                        setLoadingState('updoot-loading')
                        await vote({
                            postId: post.id,
                            value: 1,
                        })
                        setLoadingState('not-loading')
                    }}
                    colorScheme={ post.voteStatus === 1 ? 'green' : undefined }
                    isLoading={ loadingState === 'updoot-loading' }
                    aria-label="updoot post" 
                    icon={<ChevronUpIcon />} 
                    borderRadius={0}
                />
                <Text fontSize="1.5rem" fontWeight="bold">
                    {post.points}
                </Text>
                <IconButton 
                    onClick={async () => {
                        if (post.voteStatus === -1) {
                            return;
                        }
                        setLoadingState('downdoot-loading')
                        await vote({
                            postId: post.id,
                            value: -1,
                        })
                        setLoadingState('not-loading')
                    }}
                    colorScheme={ post.voteStatus === -1 ? 'red' : undefined }
                    isLoading={ loadingState === 'downdoot-loading' }
                    aria-label="downdoot post" 
                    icon={<ChevronDownIcon />}                     
                    borderRadius={0}
                />
            </Flex>         
    );
}