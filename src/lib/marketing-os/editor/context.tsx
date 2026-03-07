'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import { BLOCK_REGISTRY } from '../blocks/registry'
import type { Block, BlockType, PageData } from '../blocks/types'

// ---- State ----

interface EditorState {
  pageData: PageData
  selectedBlockId: string | null
  /** 最後の保存から変更があるか */
  isDirty: boolean
}

// ---- Actions ----

type EditorAction =
  | { type: 'SET_PAGE_DATA'; pageData: PageData }
  | { type: 'ADD_BLOCK'; blockType: BlockType }
  | { type: 'REMOVE_BLOCK'; blockId: string }
  | { type: 'UPDATE_BLOCK_PROPS'; blockId: string; props: Record<string, unknown> }
  | { type: 'SELECT_BLOCK'; blockId: string | null }
  | { type: 'MARK_SAVED' }

// ---- Reducer ----

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PAGE_DATA':
      return { ...state, pageData: action.pageData, isDirty: false }

    case 'ADD_BLOCK': {
      const def = BLOCK_REGISTRY[action.blockType]
      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: action.blockType,
        props: { ...def.defaultProps },
      }
      return {
        ...state,
        pageData: {
          ...state.pageData,
          blocks: [...state.pageData.blocks, newBlock],
        },
        selectedBlockId: newBlock.id,
        isDirty: true,
      }
    }

    case 'REMOVE_BLOCK': {
      const blocks = state.pageData.blocks.filter((b) => b.id !== action.blockId)
      return {
        ...state,
        pageData: { ...state.pageData, blocks },
        selectedBlockId:
          state.selectedBlockId === action.blockId ? null : state.selectedBlockId,
        isDirty: true,
      }
    }

    case 'UPDATE_BLOCK_PROPS': {
      const blocks = state.pageData.blocks.map((b) =>
        b.id === action.blockId
          ? { ...b, props: { ...b.props, ...action.props } }
          : b
      )
      return {
        ...state,
        pageData: { ...state.pageData, blocks },
        isDirty: true,
      }
    }

    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.blockId }

    case 'MARK_SAVED':
      return { ...state, isDirty: false }

    default:
      return state
  }
}

// ---- Context ----

interface EditorContextValue {
  state: EditorState
  addBlock: (blockType: BlockType) => void
  removeBlock: (blockId: string) => void
  updateBlockProps: (blockId: string, props: Record<string, unknown>) => void
  selectBlock: (blockId: string | null) => void
  setPageData: (pageData: PageData) => void
  markSaved: () => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

// ---- Provider ----

const EMPTY_PAGE: PageData = {
  id: '',
  siteId: '',
  slug: '',
  title: '',
  status: 'draft',
  blocks: [],
}

interface EditorProviderProps {
  children: ReactNode
  initialPage?: PageData
}

export function EditorProvider({ children, initialPage }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    pageData: initialPage ?? EMPTY_PAGE,
    selectedBlockId: null,
    isDirty: false,
  })

  const addBlock = useCallback(
    (blockType: BlockType) => dispatch({ type: 'ADD_BLOCK', blockType }),
    []
  )
  const removeBlock = useCallback(
    (blockId: string) => dispatch({ type: 'REMOVE_BLOCK', blockId }),
    []
  )
  const updateBlockProps = useCallback(
    (blockId: string, props: Record<string, unknown>) =>
      dispatch({ type: 'UPDATE_BLOCK_PROPS', blockId, props }),
    []
  )
  const selectBlock = useCallback(
    (blockId: string | null) => dispatch({ type: 'SELECT_BLOCK', blockId }),
    []
  )
  const setPageData = useCallback(
    (pageData: PageData) => dispatch({ type: 'SET_PAGE_DATA', pageData }),
    []
  )
  const markSaved = useCallback(() => dispatch({ type: 'MARK_SAVED' }), [])

  return (
    <EditorContext.Provider
      value={{ state, addBlock, removeBlock, updateBlockProps, selectBlock, setPageData, markSaved }}
    >
      {children}
    </EditorContext.Provider>
  )
}

// ---- Hook ----

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
