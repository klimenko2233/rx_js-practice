import './App.css'
import {HttpExample} from './components/HttpExample.tsx';
import {SearchPosts} from './components/SearchPosts.tsx';
// import { ObservableExample } from './components/ObservableExample';
// import {EventObservable} from './components/EventObservable.tsx';
// import {CombineObservables} from './components/CombineObservables.tsx';
// import {SubjectsExample} from './components/SubjectsExample.tsx';
// import {SwitchMapExample} from './components/SwitchMapExample.tsx';
// import {SimpleExample} from './components/SimpleExample.tsx';

function App() {

  return (
      <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">RxJS Learning</h1>
          <p className="mb-8">Practical examples of RxJS in React</p>
          <div className="space-y-6">
              <SearchPosts />
              <HttpExample />
              {/*<SimpleExample />*/}
              {/*<ObservableExample/>*/}
              {/*<EventObservable/>*/}
              {/*<CombineObservables/>*/}
              {/*<SubjectsExample />*/}
              {/*<SwitchMapExample />*/}
          </div>
      </div>
  );
}

export default App
