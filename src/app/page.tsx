import { Scene } from '@/components/Scene';
import { Loader } from '@/components/ui/Loader';
import { Header } from '@/components/ui/Header';
import { Rail } from '@/components/ui/Rail';
import { Journey } from '@/components/ui/Journey';
import { Cursor } from '@/components/ui/Cursor';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import { RouterBridge } from '@/components/ui/RouterBridge';

export default function Home() {
  return (
    <>
      <Loader />
      <Scene />
      <Header />
      <Rail />
      <Journey />
      <Cursor />
      <SmoothScroll />
      <RouterBridge />
    </>
  );
}
