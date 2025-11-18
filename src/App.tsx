import './App.css'
import { AdvancedRegistrationForm } from './components/AdvancedRegistrationForm.tsx';
// import {UserProfile} from './components/UserProfile.tsx';
// import {HttpExample} from './components/HttpExample.tsx';
// import {SearchPosts} from './components/SearchPosts.tsx';
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
              {/*<SearchPosts />*/}
              {/*<HttpExample />*/}
              {/*<SimpleExample />*/}
              {/*<ObservableExample/>*/}
              {/*<EventObservable/>*/}
              {/*<CombineObservables/>*/}
              {/*<SubjectsExample />*/}
              {/*<SwitchMapExample />*/}
          </div>
          <div className="p-8">
              <h1 className="text-3xl font-bold mb-8">RxJS Auth with Real API</h1>
              <p className="mb-8">Real authentication flow with JSONPlaceholder API</p>

              {/*<UserProfile />*/}
          </div>
          <div className="p-8">
              <h1 className="text-3xl font-bold mb-8">RxJS Advanced Forms</h1>
              <p className="mb-8">Real-time validation with reactive forms</p>

              <AdvancedRegistrationForm />
          </div>
      </div>
  );
}

export default App
