import Head from 'next/head';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { UserProfile } from '../types/dcdn';
import { LanyardPresence } from '../types/lanyard';
import { processFlags } from '../utils/flags';
import { Profile } from '../components/Profile';
import { useRouter } from 'next/router';
import { lanyard } from '../utils/lanyard';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile>();
  const [user, setUser] = useState<LanyardPresence>();

  async function fetchProfileAndUser(id: string) {
    const user = await fetch(`https://api.lanyard.rest/v1/users/${id}`).then((r) => r.json());
    const profile = await fetch(`https://dcdn.dstn.to/profile/${id}`).then((r) => r.json());

    setProfile(profile);
    setUser(user.data);
  }

  async function presenceChange(presence: LanyardPresence, id: string) {
    if (presence.discord_user.id == id) {
      setUser(presence);

      const profile = await fetch(`https://dcdn.dstn.to/profile/${id}`).then((r) => r.json());
      setProfile(profile);
    }
  }

  useEffect(() => {
    if (router.query.id) {
      fetchProfileAndUser(router.query.id as string);

      lanyard.on('presence', (presence) => presenceChange(presence, router.query.id as string));

      return () => {
        lanyard.removeListener('presence', (presence) => presenceChange(presence, router.query.id as string));
      };
    }
  }, [router.query.id]);

  return (
    <Container>
      <Head>
        <title>Lanyard User - {user?.discord_user?.username}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>{user && profile && <Profile profile={profile} user={user} />}</Main>

      <Footer>
        <Link href="https://github.com/dustinrouillard/lanyard-online-users" target="_blank" rel="noopener noreferrer">
          Made by Dustin Rouillard. View Source on Github
        </Link>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (prefers-color-scheme: dark) {
    background: #000000;
    color: #ffffff;
  }
`;

const Main = styled.div`
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Footer = styled.div`
  width: 100%;
  height: 50px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (prefers-color-scheme: dark) {
    border-top: 1px solid #262626;
  }
`;

const Link = styled.a`
  color: inherit;
  text-decoration: none;

  :hover,
  :focus,
  :active {
    text-decoration: underline;
  }
`;
