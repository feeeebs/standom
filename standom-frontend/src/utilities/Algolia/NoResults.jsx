import { useInstantSearch } from "react-instantsearch";

function NoResults() {
    const { indexUiState } = useInstantSearch();

    return (
        <div>
            <p>
                No results for <q>{indexUiState.query}</q>.
            </p>
        </div>
    );
}

export default NoResults